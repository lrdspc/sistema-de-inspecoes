/*
  # Fix Authentication and Sessions

  1. Security Changes
    - Enable RLS on tables if not already enabled
    - Add policies for tentativas_login and sessoes if they don't exist
    - Fix UUID handling for sessions

  2. Changes
    - Add default test user
*/

-- Enable RLS on tables if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'tentativas_login' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE tentativas_login ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'sessoes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public to create login attempts" ON tentativas_login;
  DROP POLICY IF EXISTS "Allow public to read login attempts" ON tentativas_login;
  DROP POLICY IF EXISTS "Users can manage their own sessions" ON sessoes;
END $$;

-- Create policies
CREATE POLICY "Allow public to create login attempts"
  ON tentativas_login
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to read login attempts"
  ON tentativas_login
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own sessions"
  ON sessoes
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Create test user if not exists
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f7f2c900-3f6c-4776-8459-9a4ced3ed3c4',
  'authenticated',
  'authenticated',
  'tecnico@exemplo.com',
  crypt('123456', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome": "Técnico Demonstração", "cargo": "Técnico", "unidadeRegional": "SP"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;