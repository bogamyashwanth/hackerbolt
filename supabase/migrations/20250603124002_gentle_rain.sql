/*
  # Add OTP Authentication

  1. New Tables
    - `otp_codes`
      - `id` (uuid, primary key)
      - `email` (text)
      - `code` (text)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `used_at` (timestamp)
      - `attempts` (integer)

  2. Security
    - Enable RLS on `otp_codes` table
    - Add policy for validating OTP codes
*/

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  attempts integer DEFAULT 0,
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at),
  CONSTRAINT max_attempts CHECK (attempts <= 3)
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Function to generate and store OTP
CREATE OR REPLACE FUNCTION request_otp(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
BEGIN
  -- Generate 6-digit code
  new_code := floor(random() * 900000 + 100000)::text;
  
  -- Insert new OTP code
  INSERT INTO otp_codes (
    email,
    code,
    expires_at
  ) VALUES (
    user_email,
    new_code,
    now() + interval '5 minutes'
  );
  
  RETURN new_code;
END;
$$;

-- Function to validate OTP
CREATE OR REPLACE FUNCTION validate_otp(user_email text, user_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp otp_codes%ROWTYPE;
BEGIN
  -- Get and lock the latest unused OTP for this email
  SELECT * INTO otp
  FROM otp_codes
  WHERE email = user_email
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE otp_codes
  SET attempts = attempts + 1
  WHERE id = otp.id;
  
  -- Check if code matches and mark as used
  IF otp.code = user_code AND otp.attempts < 3 THEN
    UPDATE otp_codes
    SET used_at = now()
    WHERE id = otp.id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;