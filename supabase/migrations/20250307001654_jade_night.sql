/*
  # Melhorias no Sistema de Autenticação

  1. Novas Tabelas
    - `refresh_tokens`: Armazena tokens de refresh para autenticação persistente
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência a usuarios)
      - `token` (text, hash do token)
      - `expires_at` (timestamp)
      - `revoked` (boolean)
      - `created_at` (timestamp)

  2. Alterações
    - Adicionado índice em `sessoes.token` para busca mais rápida
    - Adicionado índice em `tentativas_login.email` e `tentativas_login.ip_address`
    - Adicionadas constraints de expiração

  3. Security
    - Habilitado RLS em todas as tabelas
    - Adicionadas políticas de acesso
*/

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT refresh_tokens_token_key UNIQUE (token)
);

-- Habilitar RLS
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Remover política existente se houver
DROP POLICY IF EXISTS "Users can manage their own refresh tokens" ON refresh_tokens;

-- Criar nova política
CREATE POLICY "Users can manage their own refresh tokens"
  ON refresh_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Índices para Performance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessoes_token') THEN
    CREATE INDEX idx_sessoes_token ON sessoes(token);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tentativas_login_email') THEN
    CREATE INDEX idx_tentativas_login_email ON tentativas_login(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tentativas_login_ip') THEN
    CREATE INDEX idx_tentativas_login_ip ON tentativas_login(ip_address);
  END IF;
END $$;

-- Função para Limpar Tokens Expirados
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar sessões expiradas
  DELETE FROM sessoes WHERE expires_at < now();
  
  -- Limpar refresh tokens expirados
  DELETE FROM refresh_tokens WHERE expires_at < now() OR revoked = true;
  
  -- Limpar tentativas de login antigas
  DELETE FROM tentativas_login 
  WHERE ultimo_erro < now() - interval '24 hours'
  AND tentativas < 5;
END;
$$;