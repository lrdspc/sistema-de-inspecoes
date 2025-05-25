/*
  # Configuração do Sistema de Autenticação

  1. Novas Tabelas
    - `usuarios`
      - Dados básicos do usuário
      - Informações de perfil
      - Configurações de segurança
    - `sessoes`
      - Controle de sessões ativas
      - Tokens de acesso
    - `tentativas_login`
      - Proteção contra força bruta
    - `tokens_recuperacao`
      - Tokens para reset de senha

  2. Security
    - Enable RLS em todas as tabelas
    - Políticas de acesso granular
    - Proteção contra SQL injection
*/

-- Tabela de Usuários
CREATE TABLE usuarios (
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
CREATE TABLE sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  token text NOT NULL,
  user_agent text,
  ip_address inet,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Tentativas de Login
CREATE TABLE tentativas_login (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  tentativas integer DEFAULT 1,
  primeiro_erro timestamptz DEFAULT now(),
  ultimo_erro timestamptz DEFAULT now()
);

-- Tabela de Tokens de Recuperação
CREATE TABLE tokens_recuperacao (
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
CREATE POLICY "Usuários podem ver apenas seus próprios dados"
  ON usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados"
  ON usuarios
  FOR UPDATE
  USING (auth.uid() = id);

-- Funções Auxiliares
CREATE OR REPLACE FUNCTION check_password_strength(password text)
RETURNS boolean AS $$
BEGIN
  -- Mínimo 8 caracteres
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Deve conter letra maiúscula
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Deve conter letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Deve conter número
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Deve conter caractere especial
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;