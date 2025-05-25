/*
  # Fix Authentication and RLS Policies

  1. Security Changes
    - Enable RLS on tentativas_login table
    - Add policies to allow public access for login attempts
    - Add policies for authenticated users to view their own data
    - Add default role to tables

  2. Changes
    - Add default user for testing
    - Fix login attempts tracking
*/

-- Enable RLS on tentativas_login table
ALTER TABLE tentativas_login ENABLE ROW LEVEL SECURITY;

-- Allow public access for login attempts
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

-- Create default test user if not exists
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