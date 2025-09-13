-- Criação das tabelas para sistema de webhooks com retry e dead letter queue
-- Migration: 20241220_create_webhook_tables.sql

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Enum para status do webhook
CREATE TYPE webhook_status AS ENUM (
  'pending',
  'processing', 
  'success',
  'failed',
  'dead_letter',
  'cancelled'
);

-- Enum para métodos HTTP
CREATE TYPE http_method AS ENUM (
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
);

-- Tabela principal de webhooks
CREATE TABLE webhook_queue (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  method http_method NOT NULL DEFAULT 'POST',
  headers JSONB DEFAULT '{}',
  body JSONB,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  max_retries INTEGER NOT NULL DEFAULT 5 CHECK (max_retries >= 0),
  retry_delay INTEGER NOT NULL DEFAULT 1000 CHECK (retry_delay >= 0),
  timeout INTEGER NOT NULL DEFAULT 30000 CHECK (timeout > 0),
  metadata JSONB DEFAULT '{}',
  status webhook_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  dead_letter_reason TEXT,
  dead_letter_at TIMESTAMPTZ,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ
);

-- Tabela de tentativas de webhook
CREATE TABLE webhook_attempts (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES webhook_queue(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  status webhook_status NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration INTEGER, -- em millisegundos
  http_status INTEGER,
  response JSONB,
  error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de estatísticas de webhooks (agregadas por hora)
CREATE TABLE webhook_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hour_bucket TIMESTAMPTZ NOT NULL,
  domain TEXT NOT NULL,
  total_webhooks INTEGER NOT NULL DEFAULT 0,
  successful_webhooks INTEGER NOT NULL DEFAULT 0,
  failed_webhooks INTEGER NOT NULL DEFAULT 0,
  dead_letter_webhooks INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  average_duration NUMERIC(10,2),
  success_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hour_bucket, domain)
);

-- Tabela de configurações de webhook por domínio
CREATE TABLE webhook_domain_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL UNIQUE,
  max_concurrent INTEGER NOT NULL DEFAULT 5 CHECK (max_concurrent > 0),
  rate_limit_per_second INTEGER NOT NULL DEFAULT 10 CHECK (rate_limit_per_second > 0),
  circuit_breaker_enabled BOOLEAN NOT NULL DEFAULT true,
  circuit_breaker_threshold INTEGER NOT NULL DEFAULT 5,
  circuit_breaker_timeout INTEGER NOT NULL DEFAULT 60000,
  custom_headers JSONB DEFAULT '{}',
  timeout_override INTEGER CHECK (timeout_override > 0),
  retry_override INTEGER CHECK (retry_override >= 0),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX idx_webhook_queue_priority_created ON webhook_queue(priority DESC, created_at ASC) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_webhook_queue_scheduled ON webhook_queue(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_webhook_queue_expires ON webhook_queue(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_webhook_queue_created_status ON webhook_queue(created_at, status);
CREATE INDEX idx_webhook_queue_url_domain ON webhook_queue USING GIN ((substring(url from 'https?://([^/]+)')) gin_trgm_ops);

CREATE INDEX idx_webhook_attempts_webhook_id ON webhook_attempts(webhook_id);
CREATE INDEX idx_webhook_attempts_next_retry ON webhook_attempts(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX idx_webhook_attempts_started_at ON webhook_attempts(started_at);

CREATE INDEX idx_webhook_stats_hour_bucket ON webhook_stats(hour_bucket DESC);
CREATE INDEX idx_webhook_stats_domain ON webhook_stats(domain);

CREATE INDEX idx_webhook_domain_configs_domain ON webhook_domain_configs(domain);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_webhook_queue_updated_at 
  BEFORE UPDATE ON webhook_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_domain_configs_updated_at 
  BEFORE UPDATE ON webhook_domain_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para extrair domínio da URL
CREATE OR REPLACE FUNCTION extract_domain(url TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN substring(url from 'https?://([^/]+)');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para agregar estatísticas por hora
CREATE OR REPLACE FUNCTION aggregate_webhook_stats()
RETURNS void AS $$
DECLARE
  current_hour TIMESTAMPTZ;
  stats_record RECORD;
BEGIN
  -- Pega a hora atual truncada
  current_hour := date_trunc('hour', NOW() - INTERVAL '1 hour');
  
  -- Agrega estatísticas por domínio para a hora anterior
  FOR stats_record IN
    SELECT 
      extract_domain(wq.url) as domain,
      COUNT(*) as total_webhooks,
      COUNT(*) FILTER (WHERE wq.status = 'success') as successful_webhooks,
      COUNT(*) FILTER (WHERE wq.status = 'failed') as failed_webhooks,
      COUNT(*) FILTER (WHERE wq.status = 'dead_letter') as dead_letter_webhooks,
      COALESCE(SUM(wa.attempt_count), 0) as total_attempts,
      ROUND(AVG(wa.avg_duration), 2) as average_duration,
      ROUND(
        CASE 
          WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE wq.status = 'success')::NUMERIC / COUNT(*)) * 100
          ELSE 0
        END, 2
      ) as success_rate
    FROM webhook_queue wq
    LEFT JOIN (
      SELECT 
        webhook_id,
        COUNT(*) as attempt_count,
        AVG(duration) as avg_duration
      FROM webhook_attempts
      WHERE started_at >= current_hour AND started_at < current_hour + INTERVAL '1 hour'
      GROUP BY webhook_id
    ) wa ON wq.id = wa.webhook_id
    WHERE wq.created_at >= current_hour AND wq.created_at < current_hour + INTERVAL '1 hour'
    GROUP BY extract_domain(wq.url)
  LOOP
    -- Insere ou atualiza estatísticas
    INSERT INTO webhook_stats (
      hour_bucket,
      domain,
      total_webhooks,
      successful_webhooks,
      failed_webhooks,
      dead_letter_webhooks,
      total_attempts,
      average_duration,
      success_rate
    ) VALUES (
      current_hour,
      stats_record.domain,
      stats_record.total_webhooks,
      stats_record.successful_webhooks,
      stats_record.failed_webhooks,
      stats_record.dead_letter_webhooks,
      stats_record.total_attempts,
      stats_record.average_duration,
      stats_record.success_rate
    )
    ON CONFLICT (hour_bucket, domain) DO UPDATE SET
      total_webhooks = EXCLUDED.total_webhooks,
      successful_webhooks = EXCLUDED.successful_webhooks,
      failed_webhooks = EXCLUDED.failed_webhooks,
      dead_letter_webhooks = EXCLUDED.dead_letter_webhooks,
      total_attempts = EXCLUDED.total_attempts,
      average_duration = EXCLUDED.average_duration,
      success_rate = EXCLUDED.success_rate;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de webhooks antigos
CREATE OR REPLACE FUNCTION cleanup_old_webhooks(retention_days INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Remove webhooks antigos que foram processados com sucesso ou estão em dead letter
  DELETE FROM webhook_queue 
  WHERE created_at < cutoff_date 
    AND status IN ('success', 'dead_letter', 'cancelled');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Remove tentativas órfãs (caso existam)
  DELETE FROM webhook_attempts 
  WHERE started_at < cutoff_date 
    AND webhook_id NOT IN (SELECT id FROM webhook_queue);
  
  -- Remove estatísticas antigas (mantém por mais tempo)
  DELETE FROM webhook_stats 
  WHERE hour_bucket < NOW() - (retention_days * 2 || ' days')::INTERVAL;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter próximos webhooks para processamento
CREATE OR REPLACE FUNCTION get_next_webhooks_for_processing(
  batch_size INTEGER DEFAULT 50,
  max_concurrent_per_domain INTEGER DEFAULT 5
)
RETURNS TABLE (
  webhook_id TEXT,
  url TEXT,
  method http_method,
  headers JSONB,
  body JSONB,
  priority INTEGER,
  max_retries INTEGER,
  retry_delay INTEGER,
  timeout INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  domain TEXT,
  current_processing_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH domain_counts AS (
    SELECT 
      extract_domain(wq.url) as domain,
      COUNT(*) as processing_count
    FROM webhook_queue wq
    WHERE wq.status = 'processing'
    GROUP BY extract_domain(wq.url)
  ),
  eligible_webhooks AS (
    SELECT 
      wq.id,
      wq.url,
      wq.method,
      wq.headers,
      wq.body,
      wq.priority,
      wq.max_retries,
      wq.retry_delay,
      wq.timeout,
      wq.metadata,
      wq.created_at,
      wq.scheduled_at,
      wq.expires_at,
      extract_domain(wq.url) as domain,
      COALESCE(dc.processing_count, 0) as current_processing_count,
      wdc.max_concurrent,
      ROW_NUMBER() OVER (
        PARTITION BY extract_domain(wq.url) 
        ORDER BY wq.priority DESC, wq.created_at ASC
      ) as domain_rank
    FROM webhook_queue wq
    LEFT JOIN domain_counts dc ON extract_domain(wq.url) = dc.domain
    LEFT JOIN webhook_domain_configs wdc ON extract_domain(wq.url) = wdc.domain
    WHERE wq.status = 'pending'
      AND (wq.scheduled_at IS NULL OR wq.scheduled_at <= NOW())
      AND (wq.expires_at IS NULL OR wq.expires_at > NOW())
      AND (
        wdc.enabled IS NULL OR wdc.enabled = true
      )
      -- Verifica se não excede limite de processamento por domínio
      AND COALESCE(dc.processing_count, 0) < COALESCE(wdc.max_concurrent, max_concurrent_per_domain)
      -- Verifica se não está em cooldown de retry
      AND NOT EXISTS (
        SELECT 1 FROM webhook_attempts wa 
        WHERE wa.webhook_id = wq.id 
          AND wa.next_retry_at IS NOT NULL 
          AND wa.next_retry_at > NOW()
      )
  )
  SELECT 
    ew.id,
    ew.url,
    ew.method,
    ew.headers,
    ew.body,
    ew.priority,
    ew.max_retries,
    ew.retry_delay,
    ew.timeout,
    ew.metadata,
    ew.created_at,
    ew.scheduled_at,
    ew.expires_at,
    ew.domain,
    ew.current_processing_count
  FROM eligible_webhooks ew
  WHERE ew.current_processing_count < COALESCE(ew.max_concurrent, max_concurrent_per_domain)
    AND ew.domain_rank <= (COALESCE(ew.max_concurrent, max_concurrent_per_domain) - ew.current_processing_count)
  ORDER BY ew.priority DESC, ew.created_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar webhook como processando
CREATE OR REPLACE FUNCTION mark_webhook_processing(webhook_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  UPDATE webhook_queue 
  SET status = 'processing', updated_at = NOW()
  WHERE id = webhook_id AND status = 'pending';
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Views para relatórios e monitoramento

-- View de webhooks ativos
CREATE VIEW active_webhooks AS
SELECT 
  wq.*,
  extract_domain(wq.url) as domain,
  (
    SELECT COUNT(*) 
    FROM webhook_attempts wa 
    WHERE wa.webhook_id = wq.id
  ) as attempt_count,
  (
    SELECT wa.next_retry_at 
    FROM webhook_attempts wa 
    WHERE wa.webhook_id = wq.id 
    ORDER BY wa.attempt_number DESC 
    LIMIT 1
  ) as next_retry_at
FROM webhook_queue wq
WHERE wq.status IN ('pending', 'processing');

-- View de estatísticas em tempo real
CREATE VIEW webhook_realtime_stats AS
SELECT 
  extract_domain(wq.url) as domain,
  COUNT(*) as total_webhooks,
  COUNT(*) FILTER (WHERE wq.status = 'pending') as pending_webhooks,
  COUNT(*) FILTER (WHERE wq.status = 'processing') as processing_webhooks,
  COUNT(*) FILTER (WHERE wq.status = 'success') as successful_webhooks,
  COUNT(*) FILTER (WHERE wq.status = 'failed') as failed_webhooks,
  COUNT(*) FILTER (WHERE wq.status = 'dead_letter') as dead_letter_webhooks,
  ROUND(
    CASE 
      WHEN COUNT(*) FILTER (WHERE wq.status IN ('success', 'failed', 'dead_letter')) > 0 THEN 
        (COUNT(*) FILTER (WHERE wq.status = 'success')::NUMERIC / 
         COUNT(*) FILTER (WHERE wq.status IN ('success', 'failed', 'dead_letter'))) * 100
      ELSE 0
    END, 2
  ) as success_rate,
  (
    SELECT ROUND(AVG(wa.duration), 2)
    FROM webhook_attempts wa
    JOIN webhook_queue wq2 ON wa.webhook_id = wq2.id
    WHERE extract_domain(wq2.url) = extract_domain(wq.url)
      AND wa.duration IS NOT NULL
      AND wa.started_at >= NOW() - INTERVAL '1 hour'
  ) as avg_duration_last_hour
FROM webhook_queue wq
WHERE wq.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY extract_domain(wq.url)
ORDER BY total_webhooks DESC;

-- View de dead letter queue
CREATE VIEW dead_letter_queue AS
SELECT 
  wq.*,
  extract_domain(wq.url) as domain,
  (
    SELECT COUNT(*) 
    FROM webhook_attempts wa 
    WHERE wa.webhook_id = wq.id
  ) as total_attempts,
  (
    SELECT wa.error 
    FROM webhook_attempts wa 
    WHERE wa.webhook_id = wq.id 
    ORDER BY wa.attempt_number DESC 
    LIMIT 1
  ) as last_error
FROM webhook_queue wq
WHERE wq.status = 'dead_letter'
ORDER BY wq.dead_letter_at DESC;

-- Políticas RLS (Row Level Security)
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_domain_configs ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo para usuários autenticados
CREATE POLICY "Allow full access for authenticated users" ON webhook_queue
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access for authenticated users" ON webhook_attempts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access for authenticated users" ON webhook_stats
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access for authenticated users" ON webhook_domain_configs
  FOR ALL USING (auth.role() = 'authenticated');

-- Política para permitir acesso de leitura para usuários anônimos (se necessário)
CREATE POLICY "Allow read access for service role" ON webhook_queue
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow read access for service role" ON webhook_attempts
  FOR SELECT USING (auth.role() = 'service_role');

-- Configurações iniciais
INSERT INTO webhook_domain_configs (domain, max_concurrent, rate_limit_per_second) VALUES
('localhost', 10, 50),
('127.0.0.1', 10, 50),
('api.stripe.com', 5, 10),
('hooks.slack.com', 3, 5),
('discord.com', 3, 5)
ON CONFLICT (domain) DO NOTHING;

-- Agendamento de tarefas automáticas (requer pg_cron)
-- Executa agregação de estatísticas a cada hora
SELECT cron.schedule('webhook-stats-aggregation', '0 * * * *', 'SELECT aggregate_webhook_stats();');

-- Executa limpeza de webhooks antigos diariamente às 2:00
SELECT cron.schedule('webhook-cleanup', '0 2 * * *', 'SELECT cleanup_old_webhooks(7);');

-- Comentários para documentação
COMMENT ON TABLE webhook_queue IS 'Fila principal de webhooks com retry exponencial';
COMMENT ON TABLE webhook_attempts IS 'Histórico de tentativas de execução de webhooks';
COMMENT ON TABLE webhook_stats IS 'Estatísticas agregadas de webhooks por hora e domínio';
COMMENT ON TABLE webhook_domain_configs IS 'Configurações específicas por domínio';

COMMENT ON COLUMN webhook_queue.priority IS 'Prioridade do webhook (1=baixa, 5=emergência)';
COMMENT ON COLUMN webhook_queue.max_retries IS 'Número máximo de tentativas';
COMMENT ON COLUMN webhook_queue.retry_delay IS 'Delay inicial entre tentativas em ms';
COMMENT ON COLUMN webhook_queue.timeout IS 'Timeout da requisição em ms';

COMMENT ON FUNCTION aggregate_webhook_stats() IS 'Agrega estatísticas de webhooks por hora';
COMMENT ON FUNCTION cleanup_old_webhooks(INTEGER) IS 'Remove webhooks antigos baseado no período de retenção';
COMMENT ON FUNCTION get_next_webhooks_for_processing(INTEGER, INTEGER) IS 'Obtém próximos webhooks elegíveis para processamento';