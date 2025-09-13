-- Migração para criar tabelas do sistema APM
-- Criado em: 2024-12-20

-- Tabela para métricas de performance
CREATE TABLE IF NOT EXISTS apm_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ms',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimizar consultas de métricas
CREATE INDEX IF NOT EXISTS idx_apm_metrics_name ON apm_metrics(name);
CREATE INDEX IF NOT EXISTS idx_apm_metrics_timestamp ON apm_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_apm_metrics_name_timestamp ON apm_metrics(name, timestamp);
CREATE INDEX IF NOT EXISTS idx_apm_metrics_tags ON apm_metrics USING GIN(tags);

-- Tabela para eventos de erro
CREATE TABLE IF NOT EXISTS apm_errors (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  level TEXT NOT NULL CHECK (level IN ('error', 'warning', 'critical')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT,
  session_id TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimizar consultas de erros
CREATE INDEX IF NOT EXISTS idx_apm_errors_level ON apm_errors(level);
CREATE INDEX IF NOT EXISTS idx_apm_errors_timestamp ON apm_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_apm_errors_user_id ON apm_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_apm_errors_session_id ON apm_errors(session_id);

-- Tabela para alertas disparados
CREATE TABLE IF NOT EXISTS apm_alerts (
  id SERIAL PRIMARY KEY,
  rule_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channels TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_apm_alerts_rule_id ON apm_alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_apm_alerts_triggered_at ON apm_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_apm_alerts_metric ON apm_alerts(metric);

-- Tabela para traces de transações
CREATE TABLE IF NOT EXISTS apm_transactions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('http', 'database', 'external', 'custom')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'error')),
  metadata JSONB DEFAULT '{}',
  spans JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transações
CREATE INDEX IF NOT EXISTS idx_apm_transactions_name ON apm_transactions(name);
CREATE INDEX IF NOT EXISTS idx_apm_transactions_type ON apm_transactions(type);
CREATE INDEX IF NOT EXISTS idx_apm_transactions_status ON apm_transactions(status);
CREATE INDEX IF NOT EXISTS idx_apm_transactions_start_time ON apm_transactions(start_time);
CREATE INDEX IF NOT EXISTS idx_apm_transactions_duration ON apm_transactions(duration);

-- Tabela para saúde do sistema
CREATE TABLE IF NOT EXISTS apm_system_health (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cpu NUMERIC NOT NULL,
  memory NUMERIC NOT NULL,
  disk NUMERIC NOT NULL,
  network_latency NUMERIC NOT NULL,
  network_throughput NUMERIC NOT NULL,
  database_connections INTEGER NOT NULL,
  database_query_time NUMERIC NOT NULL,
  database_status TEXT NOT NULL CHECK (database_status IN ('healthy', 'degraded', 'down')),
  redis_connections INTEGER,
  redis_memory NUMERIC,
  redis_status TEXT CHECK (redis_status IN ('healthy', 'degraded', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para saúde do sistema
CREATE INDEX IF NOT EXISTS idx_apm_system_health_timestamp ON apm_system_health(timestamp);
CREATE INDEX IF NOT EXISTS idx_apm_system_health_database_status ON apm_system_health(database_status);

-- Tabela para configurações de alertas
CREATE TABLE IF NOT EXISTS apm_alert_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  metric TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('gt', 'lt', 'eq', 'gte', 'lte')),
  threshold NUMERIC NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- em segundos
  enabled BOOLEAN NOT NULL DEFAULT true,
  channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para regras de alerta
CREATE INDEX IF NOT EXISTS idx_apm_alert_rules_metric ON apm_alert_rules(metric);
CREATE INDEX IF NOT EXISTS idx_apm_alert_rules_enabled ON apm_alert_rules(enabled);

-- Tabela para health check simples
CREATE TABLE IF NOT EXISTS apm_health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insere um registro inicial para health check
INSERT INTO apm_health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Função para limpeza automática de dados antigos
CREATE OR REPLACE FUNCTION cleanup_apm_data()
RETURNS void AS $$
BEGIN
  -- Remove métricas mais antigas que 30 dias
  DELETE FROM apm_metrics WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Remove erros mais antigos que 90 dias
  DELETE FROM apm_errors WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Remove transações mais antigas que 7 dias
  DELETE FROM apm_transactions WHERE start_time < NOW() - INTERVAL '7 days';
  
  -- Remove dados de saúde mais antigos que 30 dias
  DELETE FROM apm_system_health WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Remove alertas resolvidos mais antigos que 30 dias
  DELETE FROM apm_alerts WHERE resolved_at IS NOT NULL AND resolved_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Agenda limpeza automática (executar diariamente às 2h da manhã)
-- Nota: Isso requer extensão pg_cron que pode não estar disponível no Supabase
-- SELECT cron.schedule('cleanup-apm-data', '0 2 * * *', 'SELECT cleanup_apm_data();');

-- Views para consultas otimizadas

-- View para métricas agregadas por hora
CREATE OR REPLACE VIEW apm_metrics_hourly AS
SELECT 
  name,
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as count,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99_value
FROM apm_metrics
GROUP BY name, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- View para erros por dia
CREATE OR REPLACE VIEW apm_errors_daily AS
SELECT 
  DATE_TRUNC('day', timestamp) as day,
  level,
  COUNT(*) as count
FROM apm_errors
GROUP BY DATE_TRUNC('day', timestamp), level
ORDER BY day DESC;

-- View para transações mais lentas
CREATE OR REPLACE VIEW apm_slowest_transactions AS
SELECT 
  name,
  type,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
FROM apm_transactions
WHERE duration IS NOT NULL
GROUP BY name, type
ORDER BY avg_duration DESC;

-- View para dashboard de saúde
CREATE OR REPLACE VIEW apm_health_dashboard AS
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  AVG(cpu) as avg_cpu,
  AVG(memory) as avg_memory,
  AVG(disk) as avg_disk,
  AVG(network_latency) as avg_network_latency,
  AVG(database_query_time) as avg_db_query_time
FROM apm_system_health
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('minute', timestamp)
ORDER BY minute DESC;

-- Políticas RLS (Row Level Security)
ALTER TABLE apm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE apm_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE apm_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE apm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apm_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE apm_alert_rules ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserção e leitura (ajustar conforme necessário)
CREATE POLICY "Allow all operations on apm_metrics" ON apm_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on apm_errors" ON apm_errors FOR ALL USING (true);
CREATE POLICY "Allow all operations on apm_alerts" ON apm_alerts FOR ALL USING (true);
CREATE POLICY "Allow all operations on apm_transactions" ON apm_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on apm_system_health" ON apm_system_health FOR ALL USING (true);
CREATE POLICY "Allow all operations on apm_alert_rules" ON apm_alert_rules FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE apm_metrics IS 'Armazena métricas de performance da aplicação';
COMMENT ON TABLE apm_errors IS 'Armazena eventos de erro capturados pela aplicação';
COMMENT ON TABLE apm_alerts IS 'Armazena alertas disparados pelo sistema de monitoramento';
COMMENT ON TABLE apm_transactions IS 'Armazena traces de transações para análise de performance';
COMMENT ON TABLE apm_system_health IS 'Armazena métricas de saúde do sistema';
COMMENT ON TABLE apm_alert_rules IS 'Armazena configurações de regras de alerta';