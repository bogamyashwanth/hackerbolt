/*
  # Social Platform Schema

  1. New Tables
    - `users`
      - Standard user fields plus:
      - `last_post_time` for tracking post frequency
      - `available_invites` for managing invite allocation
    - `invite_codes`
      - Tracks invite code creation and usage
      - Includes expiration and usage status
    - `posts`
      - User posts with timestamps for frequency limiting

  2. Security
    - Enable RLS on all tables
    - Policies for user data protection
    - Secure invite code management
*/

-- Create users table with additional fields
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_post_time timestamptz,
  available_invites integer DEFAULT 3,
  invited_by uuid REFERENCES users(id)
);

-- Create invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid REFERENCES users(id),
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Invite codes policies
CREATE POLICY "Users can read own invite codes"
  ON invite_codes
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR used_by = auth.uid());

CREATE POLICY "Users can create invite codes"
  ON invite_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Posts policies
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Functions

-- Function to validate and use invite code
CREATE OR REPLACE FUNCTION use_invite_code(invite_code text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite invite_codes%ROWTYPE;
BEGIN
  -- Get and lock the invite code
  SELECT * INTO invite
  FROM invite_codes
  WHERE code = invite_code
    AND used_at IS NULL
    AND expires_at > now()
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Mark invite as used
  UPDATE invite_codes
  SET used_at = now(),
      used_by = user_id
  WHERE id = invite.id;
  
  -- Update user's invited_by field
  UPDATE users
  SET invited_by = invite.created_by
  WHERE id = user_id;
  
  RETURN true;
END;
$$;