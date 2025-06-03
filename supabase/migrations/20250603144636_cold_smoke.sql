/*
  # Admin Authentication Setup

  1. Changes
    - Add password change tracking columns to admin_auth_settings
    - Add functions for password validation and management
    - Initialize admin user with secure defaults
  
  2. Security
    - All functions are SECURITY DEFINER
    - Password validation with strict requirements
    - Secure password storage with proper hashing
*/

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
BEGIN
  -- Create admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email = 'yashwanthbogam4@gmail.com'
  ) THEN
    INSERT INTO users (email, username)
    VALUES ('yashwanthbogam4@gmail.com', 'admin');

    INSERT INTO admin_users (user_id)
    SELECT id FROM users WHERE email = 'yashwanthbogam4@gmail.com';

    -- Initialize admin auth settings with default password
    INSERT INTO admin_auth_settings (
      user_id,
      password_hash,
      initial_password_hash,
      password_change_required,
      mfa_enabled,
      security_key_required
    )
    SELECT 
      user_id,
      crypt('admin', gen_salt('bf')),
      crypt('admin', gen_salt('bf')),
      'required',
      false,
      false
    FROM admin_users
    WHERE NOT EXISTS (
      SELECT 1 FROM admin_auth_settings
    );
  END IF;
END $$;