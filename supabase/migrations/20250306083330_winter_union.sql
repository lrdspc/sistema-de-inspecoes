/*
  # Sistema de Autenticação

  1. Novas Tabelas
    - `usuarios`: Armazena informações dos usuários
    - `sessoes`: Gerencia sessões ativas
    - `tentativas_login`: Controla tentativas de login para proteção
    - `tokens_recuperacao`: Gerencia tokens de recuperação de senha

  2. Segurança
    - Habilitado RLS em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Proteção contra força bruta
    - Tokens temporários para recuperação de senha

  3. Campos Importantes
    - Hash de senha com bcrypt
    - Tokens com expiração
    - Registro de data/hora para todas as operações
*/

-- Configurar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  nome text NOT NULL,
  cargo text NOT NULL,
  unidade_regional text NOT NULL,
  foto_url text,
  ativo boolean DEFAULT true,
  verificado boolean DEFAULT false,
  ultimo_login timestamptz,
  tentativas_falhas integer DEFAULT 0,
  bloqueado_ate timestamptz,
  mfa_habilitado boolean DEFAULT false,
  mfa_secret text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  token text NOT NULL,
  user_agent text,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Tentativas de Login
CREATE TABLE IF NOT EXISTS tentativas_login (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  tentativas integer DEFAULT 1,
  primeiro_erro timestamptz DEFAULT now(),
  ultimo_erro timestamptz DEFAULT now()
);

-- Tabela de Tokens de Recuperação
CREATE TABLE IF NOT EXISTS tokens_recuperacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  token text NOT NULL,
  usado boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentativas_login ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_recuperacao ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança

-- Usuários podem ver/editar seus próprios dados
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
CREATE POLICY "usuarios_select_policy"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
CREATE POLICY "usuarios_update_policy"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Sessões são privadas ao usuário
DROP POLICY IF EXISTS "sessoes_select_policy" ON sessoes;
CREATE POLICY "sessoes_select_policy"
  ON sessoes
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "sessoes_all_policy" ON sessoes;
CREATE POLICY "sessoes_all_policy"
  ON sessoes
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid());

-- Funções e Triggers

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Função para limpar tentativas de login antigas
CREATE OR REPLACE FUNCTION limpar_tentativas_login()
RETURNS void AS $$
BEGIN
  DELETE FROM tentativas_login
  WHERE ultimo_erro < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Inserir usuário de demonstração
INSERT INTO usuarios (
  id,
  email,
  senha_hash,
  nome,
  cargo,
  unidade_regional,
  verificado,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'tecnico@exemplo.com',
  crypt('123456', gen_salt('bf')),
  'Técnico Demonstração',
  'Técnico',
  'SP',
  true,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;