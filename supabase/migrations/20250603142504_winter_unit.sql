/*
  # Create Admin User

  1. Changes
    - Creates a new admin user with specified email
    - Sets up initial password with change requirement
    - Configures admin privileges and permissions
    - Adds audit logging

  2. Security
    - Password is securely hashed
    - Email format is validated
    - Admin privileges are properly scoped
*/

-- Create admin user with specified email
DO $$ 
DECLARE
  v_user_id uuid;
  v_username text := 'admin_' || substr(md5(random()::text), 1, 8);
BEGIN
  -- Validate email format
  IF NOT check_admin_email('yashwanthbogam4@gmail.com') THEN
    RAISE EXCEPTION 'Invalid admin email address';
  END IF;

  -- Create user if not exists
  INSERT INTO users (email, username)
  VALUES ('yashwanthbogam4@gmail.com', v_username)
  ON CONFLICT (email) DO UPDATE
  SET username = v_username
  RETURNING id INTO v_user_id;

  -- Grant admin privileges
  INSERT INTO admin_users (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize admin auth settings
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

  -- Log admin creation
  INSERT INTO admin_audit_logs (
    user_id,
    action,
    details
  )
  VALUES (
    v_user_id,
    'admin_created',
    jsonb_build_object(
      'email', 'yashwanthbogam4@gmail.com',
      'timestamp', now(),
      'requires_password_change', true
    )
  );

END $$;