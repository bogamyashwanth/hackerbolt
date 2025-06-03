/*
  # Admin Authentication Setup

  1. Schema Changes
    - Creates password_change_status enum
    - Adds password change tracking columns to admin_auth_settings
  
  2. Functions
    - check_admin_email: Validates admin email
    - verify_admin_password: Validates password requirements
    - update_admin_password: Handles password updates with validation
  
  3. Initial Setup
    - Creates or updates admin user with default credentials
    - Configures initial auth settings
*/

-- Create enum for password change requirement status
CREATE TYPE password_change_status AS ENUM ('required', 'not_required');

-- Modify admin_auth_settings table
ALTER TABLE admin_auth_settings 
ADD COLUMN IF NOT EXISTS password_change_required password_change_status DEFAULT 'required',
ADD COLUMN IF NOT EXISTS initial_password_hash text;

-- Function to validate admin email
CREATE OR REPLACE FUNCTION check_admin_email(p_email text)
RETURNS boolean AS $$
BEGIN
  RETURN p_email = 'yashwanthbogam4@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate password requirements
CREATE OR REPLACE FUNCTION verify_admin_password(p_password text)
RETURNS boolean AS $$
BEGIN
  -- Check length
  IF length(p_password) < 8 THEN
    RETURN false;
  END IF;

  -- Check for uppercase
  IF p_password !~ '[A-Z]' THEN
    RETURN false;
  END IF;

  -- Check for lowercase
  IF p_password !~ '[a-z]' THEN
    RETURN false;
  END IF;

  -- Check for number
  IF p_password !~ '[0-9]' THEN
    RETURN false;
  END IF;

  -- Check for special character
  IF p_password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(
  p_user_id uuid,
  p_current_password text,
  p_new_password text
)
RETURNS boolean AS $$
DECLARE
  v_settings admin_auth_settings;
BEGIN
  -- Get current settings
  SELECT * INTO v_settings
  FROM admin_auth_settings
  WHERE user_id = p_user_id;

  -- Verify current password
  IF NOT (
    v_settings.password_hash = crypt(p_current_password, v_settings.password_hash) OR
    v_settings.initial_password_hash = crypt(p_current_password, v_settings.initial_password_hash)
  ) THEN
    RAISE EXCEPTION 'Invalid current password';
  END IF;

  -- Verify new password meets requirements
  IF NOT verify_admin_password(p_new_password) THEN
    RAISE EXCEPTION 'New password does not meet requirements';
  END IF;

  -- Ensure new password is different from initial password
  IF v_settings.initial_password_hash = crypt(p_new_password, v_settings.initial_password_hash) THEN
    RAISE EXCEPTION 'New password cannot be the same as initial password';
  END IF;

  -- Update password
  UPDATE admin_auth_settings
  SET 
    password_hash = crypt(p_new_password, gen_salt('bf')),
    password_change_required = 'not_required',
    password_updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize admin user with default password
DO $$ 
DECLARE
  v_user_id uuid;
BEGIN
  -- Get or create admin user
  SELECT id INTO v_user_id
  FROM users 
  WHERE email = 'yashwanthbogam4@gmail.com';

  IF v_user_id IS NULL THEN
    -- Create new admin user with unique username
    INSERT INTO users (email, username)
    VALUES ('yashwanthbogam4@gmail.com', 'admin_' || substr(md5(random()::text), 1, 8))
    RETURNING id INTO v_user_id;
  END IF;

  -- Ensure user is in admin_users
  INSERT INTO admin_users (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize or update admin auth settings
  INSERT INTO admin_auth_settings (
    user_id,
    password_hash,
    initial_password_hash,
    password_change_required,
    mfa_enabled,
    security_key_required
  )
  VALUES (
    v_user_id,
    crypt('admin', gen_salt('bf')),
    crypt('admin', gen_salt('bf')),
    'required',
    false,
    false
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    password_hash = EXCLUDED.password_hash,
    initial_password_hash = EXCLUDED.initial_password_hash,
    password_change_required = 'required';
END $$;