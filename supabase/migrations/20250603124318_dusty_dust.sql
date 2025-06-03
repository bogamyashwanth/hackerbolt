/*
  # Add admin invite code system
  
  1. New Tables
    - `admin_invite_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional)
      - `max_uses` (integer)
      - `use_count` (integer)
      - `status` (text: active/blocked)
      - `blocked_at` (timestamp)
      - `blocked_by` (uuid, references users)
  
  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add functions for code management
*/

-- Create enum for invite code status
CREATE TYPE invite_code_status AS ENUM ('active', 'blocked');

-- Create admin invite codes table
CREATE TABLE admin_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  max_uses integer NOT NULL,
  use_count integer DEFAULT 0,
  status invite_code_status DEFAULT 'active',
  blocked_at timestamptz,
  blocked_by uuid REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT positive_max_uses CHECK (max_uses > 0),
  CONSTRAINT valid_use_count CHECK (use_count <= max_uses),
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at),
  CONSTRAINT valid_block CHECK (
    (status = 'blocked' AND blocked_at IS NOT NULL AND blocked_by IS NOT NULL) OR
    (status = 'active' AND blocked_at IS NULL AND blocked_by IS NULL)
  )
);

-- Enable RLS
ALTER TABLE admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- Create admin group for managing invite codes
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- RLS Policies

-- Only admins can view invite codes
CREATE POLICY "Admins can view invite codes"
  ON admin_invite_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can create invite codes
CREATE POLICY "Admins can create invite codes"
  ON admin_invite_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can update invite codes
CREATE POLICY "Admins can update invite codes"
  ON admin_invite_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Functions

-- Function to generate a unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code(length integer DEFAULT 8)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
  success boolean := false;
BEGIN
  WHILE NOT success LOOP
    result := '';
    i := 0;
    WHILE i < length LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
      i := i + 1;
    END LOOP;
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM admin_invite_codes WHERE code = result) THEN
      success := true;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Function to create a new invite code
CREATE OR REPLACE FUNCTION create_invite_code(
  p_max_uses integer,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS admin_invite_codes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code admin_invite_codes;
BEGIN
  -- Verify admin status
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Create new invite code
  INSERT INTO admin_invite_codes (
    code,
    created_by,
    expires_at,
    max_uses
  ) VALUES (
    generate_invite_code(),
    auth.uid(),
    p_expires_at,
    p_max_uses
  )
  RETURNING * INTO new_code;

  RETURN new_code;
END;
$$;

-- Function to block an invite code
CREATE OR REPLACE FUNCTION block_invite_code(p_code_id uuid)
RETURNS admin_invite_codes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_code admin_invite_codes;
BEGIN
  -- Verify admin status
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User is not an admin';
  END IF;

  -- Update invite code status
  UPDATE admin_invite_codes
  SET status = 'blocked',
      blocked_at = now(),
      blocked_by = auth.uid()
  WHERE id = p_code_id
  RETURNING * INTO updated_code;

  RETURN updated_code;
END;
$$;

-- Function to validate and use an invite code
CREATE OR REPLACE FUNCTION validate_admin_invite_code(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite admin_invite_codes%ROWTYPE;
BEGIN
  -- Get and lock the invite code
  SELECT * INTO invite
  FROM admin_invite_codes
  WHERE code = p_code
  FOR UPDATE;
  
  -- Validate code
  IF NOT FOUND OR
     invite.status = 'blocked' OR
     (invite.expires_at IS NOT NULL AND invite.expires_at <= now()) OR
     invite.use_count >= invite.max_uses
  THEN
    RETURN false;
  END IF;
  
  -- Increment use count
  UPDATE admin_invite_codes
  SET use_count = use_count + 1
  WHERE id = invite.id;
  
  RETURN true;
END;
$$;