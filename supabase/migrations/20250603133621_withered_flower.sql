/*
  # Post Visibility System

  1. New Tables
    - `votes`: Tracks user votes on posts
    - `comments`: Stores post comments
    - `post_stats`: Maintains post engagement metrics
  
  2. Functions
    - `calculate_post_stats`: Computes post statistics
    - `update_post_stats_trigger`: Trigger function for real-time updates
  
  3. Triggers
    - Auto-updates stats on post/vote/comment changes
*/

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on posts"
  ON votes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create post_stats table
CREATE TABLE IF NOT EXISTS post_stats (
  post_id uuid PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  upvote_ratio float DEFAULT 0,
  comment_count integer DEFAULT 0,
  engagement_score float DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE post_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read post stats"
  ON post_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to calculate post stats
CREATE OR REPLACE FUNCTION calculate_post_stats(p_post_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO post_stats (
    post_id,
    upvotes,
    downvotes,
    total_votes,
    upvote_ratio,
    comment_count,
    engagement_score,
    last_updated
  )
  SELECT
    p.id,
    COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
    COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes,
    COALESCE(COUNT(v.id), 0) as total_votes,
    CASE 
      WHEN COUNT(v.id) > 0 
      THEN ROUND(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END)::float / COUNT(v.id), 2)
      ELSE 0 
    END as upvote_ratio,
    COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = p.id), 0) as comment_count,
    COALESCE(
      (SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END) + 
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id)) / 
      EXTRACT(EPOCH FROM (now() - p.created_at))/3600,
      0
    ) as engagement_score,
    now() as last_updated
  FROM posts p
  LEFT JOIN votes v ON v.post_id = p.id
  WHERE p.id = p_post_id
  GROUP BY p.id
  ON CONFLICT (post_id) DO UPDATE
  SET
    upvotes = EXCLUDED.upvotes,
    downvotes = EXCLUDED.downvotes,
    total_votes = EXCLUDED.total_votes,
    upvote_ratio = EXCLUDED.upvote_ratio,
    comment_count = EXCLUDED.comment_count,
    engagement_score = EXCLUDED.engagement_score,
    last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update stats
CREATE OR REPLACE FUNCTION update_post_stats_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM calculate_post_stats(
    CASE 
      WHEN TG_TABLE_NAME = 'posts' THEN NEW.id
      WHEN TG_TABLE_NAME = 'votes' THEN NEW.post_id
      WHEN TG_TABLE_NAME = 'comments' THEN NEW.post_id
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time stats updates
CREATE TRIGGER update_post_stats_on_post
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats_trigger();

CREATE TRIGGER update_post_stats_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats_trigger();

CREATE TRIGGER update_post_stats_on_comment
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats_trigger();

-- Initialize stats for existing posts
DO $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT id FROM posts
  LOOP
    PERFORM calculate_post_stats(post_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;