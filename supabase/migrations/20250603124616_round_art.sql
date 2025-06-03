/*
  # Enhanced Admin Authentication System

  1. New Tables
    - `admin_auth_settings`
      - MFA settings and security preferences
    - `admin_sessions`
      - Active admin session tracking
    - `admin_audit_logs`
      - Security audit trail
    - `admin_security_keys`
      - WebAuthn/FIDO2 security keys

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add functions for MFA and session management
*/

-- Admin authentication settings
CREATE TABLE admin_auth_settings (
  user_id uuid PRIMARY KEY REFERENCES admin_users(user_id),
  mfa_enabled boolean DEFAULT false,
  totp_secret text,
  password_hash text NOT NULL,
  password_updated_at timestamptz DEFAULT now(),
  security_key_required boolean DEFAULT false,
  ip_whitelist text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin sessions
CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(user_id) NOT NULL,
  token text NOT NULL,
  ip_address inet NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_active_at timestamptz DEFAULT now(),
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- Security keys for WebAuthn
CREATE TABLE admin_security_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(user_id) NOT NULL,
  credential_id text NOT NULL,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  name text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

-- Audit logs
CREATE TABLE admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(user_id),
  action text NOT NULL,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_auth_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_security_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can read own auth settings"
  ON admin_auth_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update own auth settings"
  ON admin_auth_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read own sessions"
  ON admin_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage own security keys"
  ON admin_security_keys
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Functions

-- Initialize admin authentication
CREATE OR REPLACE FUNCTION init_admin_auth(
  p_user_id uuid,
  p_password_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_auth_settings (
    user_id,
    password_hash
  ) VALUES (
    p_user_id,
    p_password_hash
  );
END;
$$;

-- Create admin session
CREATE OR REPLACE FUNCTION create_admin_session(
  p_user_id uuid,
  p_ip_address inet,
  p_user_agent text
)
RETURNS admin_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_session admin_sessions;
BEGIN
  -- Verify admin status and MFA
  IF NOT EXISTS (
    SELECT 1 FROM admin_users au
    JOIN admin_auth_settings aas ON au.user_id = aas.user_id
    WHERE au.user_id = p_user_id
    AND (NOT aas.mfa_enabled OR aas.totp_verified)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: MFA required';
  END IF;

  -- Create session
  INSERT INTO admin_sessions (
    user_id,
    token,
    ip_address,
    user_agent,
    expires_at
  ) VALUES (
    p_user_id,
    encode(gen_random_bytes(32), 'hex'),
    p_ip_address,
    p_user_agent,
    now() + interval '15 minutes'
  )
  RETURNING * INTO new_session;

  -- Log action
  INSERT INTO admin_audit_logs (
    user_id,
    action,
    ip_address,
    user_agent,
    details
  ) VALUES (
    p_user_id,
    'session_created',
    p_ip_address,
    p_user_agent,
    jsonb_build_object('session_id', new_session.id)
  );

  RETURN new_session;
END;
$$;

-- Validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session(
  p_session_id uuid,
  p_token text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_valid boolean;
BEGIN
  UPDATE admin_sessions
  SET last_active_at = now()
  WHERE id = p_session_id
    AND token = p_token
    AND expires_at > now()
  RETURNING true INTO session_valid;

  RETURN COALESCE(session_valid, false);
END;
$$;

-- Update session expiry
CREATE OR REPLACE FUNCTION update_session_expiry(
  p_session_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_sessions
  SET expires_at = now() + interval '15 minutes',
      last_active_at = now()
  WHERE id = p_session_id
    AND expires_at > now();
END;
$$;