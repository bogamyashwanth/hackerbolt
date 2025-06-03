/*
  # Set default admin password

  1. Changes
    - Sets the default admin password hash
    - Ensures password is secure and matches requirements

  2. Security
    - Password is stored as a secure hash
    - Only accessible to authenticated admin users
*/

DO $$ 
BEGIN
  -- Update admin password hash
  UPDATE admin_auth_settings
  SET 
    password_hash = crypt(' %7%X2"Y$?mx.#eM<EJ<Nu:&)22NZ45 ', gen_salt('bf')),
    password_updated_at = now()
  WHERE EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users.user_id = admin_auth_settings.user_id
  );
END $$;