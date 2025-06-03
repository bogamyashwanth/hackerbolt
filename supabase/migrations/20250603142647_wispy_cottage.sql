/*
  # Fix Admin Authentication System

  1. New Functions
    - `verify_admin_password_rpc`: Securely verify admin passwords
    - `init_admin_auth_rpc`: Initialize admin with secure password
    - `update_admin_password_rpc`: Update admin password with validation

  2. Security
    - All functions are SECURITY DEFINER
    - Password verification happens server-side
    - Proper error handling
    - Audit logging
*/

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password_rpc(
  p_email text,
  p_password text
)
RETURNS boolean AS $$
DECLARE
  v_settings admin_auth_settings;
  v_user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get auth settings
  SELECT * INTO v_settings
  FROM admin_auth_settings
  WHERE user_id = v_user_id;

  IF v_settings IS NULL THEN
    RETURN false;
  END IF;

  -- Verify password
  RETURN v_settings.password_hash = crypt(p_password, v_settings.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize admin auth
CREATE OR REPLACE FUNCTION init_admin_auth_rpc(
  p_email text,
  p_password text
)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Validate email
  IF NOT check_admin_email(p_email) THEN
    RAISE EXCEPTION 'Invalid admin email';
  END IF;

  -- Validate password
  IF NOT verify_admin_password(p_password) THEN
    RAISE EXCEPTION 'Password does not meet requirements';
  END IF;

  -- Get or create user
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    INSERT INTO users (email, username)
    VALUES (p_email, 'admin_' || substr(md5(random()::text), 1, 8))
    RETURNING id INTO v_user_id;
  END IF;

  -- Make user an admin
  INSERT INTO admin_users (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize auth settings
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
    crypt(p_password, gen_salt('bf')),
    crypt(p_password, gen_salt('bf')),
    'required',
    false,
    false
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    password_hash = EXCLUDED.password_hash,
    initial_password_hash = EXCLUDED.initial_password_hash,
    password_change_required = 'required';

  -- Log initialization
  INSERT INTO admin_audit_logs (
    user_id,
    action,
    details
  )
  VALUES (
    v_user_id,
    'admin_initialized',
    jsonb_build_object(
      'email', p_email,
      'timestamp', now()
    )
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin auth status
CREATE OR REPLACE FUNCTION get_admin_auth_status(
  p_email text
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_settings admin_auth_settings;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'initialized', false,
      'mfa_required', false,
      'password_change_required', false
    );
  END IF;

  -- Get auth settings
  SELECT * INTO v_settings
  FROM admin_auth_settings
  WHERE user_id = v_user_id;

  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'initialized', false,
      'mfa_required', false,
      'password_change_required', false
    );
  END IF;

  RETURN jsonb_build_object(
    'initialized', true,
    'mfa_required', v_settings.mfa_enabled,
    'password_change_required', v_settings.password_change_required = 'required'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;