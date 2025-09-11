-- Tabela para armazenar dados de rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time BIGINT NOT NULL,
  first_request BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);

-- Função para limpeza automática de registros expirados
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rate_limits 
  WHERE reset_time < EXTRACT(EPOCH FROM NOW()) * 1000;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_updated_at();

-- Política RLS (Row Level Security) - permite acesso apenas para usuários autenticados
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON rate_limits
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para permitir operações do sistema (service_role)
CREATE POLICY "Allow all operations for service role" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Comentários para documentação
COMMENT ON TABLE rate_limits IS 'Tabela para controle de rate limiting distribuído';
COMMENT ON COLUMN rate_limits.key IS 'Chave única para identificar o limite (ex: user:123, ip:192.168.1.1)';
COMMENT ON COLUMN rate_limits.count IS 'Número atual de requisições na janela de tempo';
COMMENT ON COLUMN rate_limits.reset_time IS 'Timestamp em millisegundos quando o limite será resetado';
COMMENT ON COLUMN rate_limits.first_request IS 'Timestamp em millisegundos da primeira requisição na janela';