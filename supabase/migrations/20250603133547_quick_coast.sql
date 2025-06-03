/*
  # Post Visibility System Implementation

  1. New Tables
    - `post_stats`: Tracks engagement metrics for posts
      - `post_id` (uuid, primary key)
      - `upvotes` (integer)
      - `downvotes` (integer)
      - `total_votes` (integer)
      - `upvote_ratio` (float)
      - `comment_count` (integer)
      - `engagement_score` (float)
      - `last_updated` (timestamptz)

  2. Functions
    - `calculate_post_stats`: Updates stats for a single post
    - `update_post_stats_trigger`: Trigger function to update stats on changes

  3. Security
    - Enable RLS on post_stats table
    - Add policy for authenticated users to read stats
*/

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

-- Enable RLS
ALTER TABLE post_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for reading post stats
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