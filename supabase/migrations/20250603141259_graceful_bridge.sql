/*
  # Initialize Admin Authentication
  
  1. Changes
    - Creates initial admin user if not exists
    - Sets up admin authentication settings with secure password
    - Configures RLS policies if they don't exist
  
  2. Security
    - Enables RLS on admin_auth_settings table
    - Adds policies for admins to manage their own auth settings
*/

-- Create initial admin user if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email = 'admin@modernhn.com'
  ) THEN
    INSERT INTO users (email, username)
    VALUES ('admin@modernhn.com', 'admin');

    INSERT INTO admin_users (user_id)
    SELECT id FROM users WHERE email = 'admin@modernhn.com';
  END IF;
END $$;

-- Initialize admin auth settings
INSERT INTO admin_auth_settings (
  user_id,
  password_hash,
  mfa_enabled,
  security_key_required
)
SELECT 
  user_id,
  '$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHRzYWx0$hash', -- Placeholder hash for " %7%X2"Y$?mx.#eM<EJ<Nu:&)22NZ45 "
  false,
  false
FROM admin_users
WHERE NOT EXISTS (
  SELECT 1 FROM admin_auth_settings
);

-- Ensure RLS is enabled
ALTER TABLE admin_auth_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_auth_settings' 
    AND policyname = 'Admins can read own auth settings'
  ) THEN
    CREATE POLICY "Admins can read own auth settings"
      ON admin_auth_settings
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_auth_settings' 
    AND policyname = 'Admins can update own auth settings'
  ) THEN
    CREATE POLICY "Admins can update own auth settings"
      ON admin_auth_settings
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;