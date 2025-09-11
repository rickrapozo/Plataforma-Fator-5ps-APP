# Estrutura do Banco de Dados

Esta pasta contém toda a estrutura organizada do banco de dados do projeto Essential Factor 5P.

## Estrutura de Pastas

```
database/
├── migrations/          # Scripts de migração SQL em ordem sequencial
├── seeds/              # Dados iniciais e de teste
├── policies/           # Políticas de segurança RLS
├── config.js           # Configuração centralizada
├── migrate.js          # Script de migração automatizada
└── README.md           # Esta documentação
```

## Migrações

As migrações estão organizadas em ordem numérica:

1. `01_initial_schema.sql` - Schema inicial com tabelas principais
2. `02_additional_tables.sql` - Tabelas adicionais de privacidade e segurança
3. `03_email_config.sql` - Configurações de email
4. `04_rate_limit_table.sql` - Tabela de controle de rate limiting

## Como Usar

### Executar Migrações

```bash
# Executar apenas migrações
node database/migrate.js migrate

# Executar apenas seeds
node database/migrate.js seed

# Executar migrações + seeds
node database/migrate.js reset
```

### Configuração

1. Configure as variáveis de ambiente:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```

2. Execute as migrações:
   ```bash
   node database/migrate.js reset
   ```

## Tabelas Principais

### users
- Usuários do sistema
- Campos: id, email, password_hash, role, created_at, updated_at

### user_progress
- Progresso dos usuários no sistema
- Campos: id, user_id, current_step, completed_steps, created_at, updated_at

### privacy_settings
- Configurações de privacidade dos usuários
- Campos: id, user_id, data_collection, marketing_emails, analytics, created_at, updated_at

### user_consents
- Consentimentos dos usuários (LGPD/GDPR)
- Campos: id, user_id, consent_type, consent_given, consent_date, ip_address

### security_events
- Log de eventos de segurança
- Campos: id, user_id, event_type, event_data, ip_address, user_agent, created_at

### admin_actions
- Log de ações administrativas
- Campos: id, admin_id, action_type, target_user_id, action_data, created_at

### rate_limits
- Controle de rate limiting
- Campos: id, identifier, action, count, window_start, created_at

## Políticas de Segurança

As políticas RLS (Row Level Security) estão configuradas para:
- Usuários só podem ver seus próprios dados
- Administradores têm acesso completo
- Logs de segurança são protegidos

## Manutenção

### Adicionar Nova Migração

1. Crie um novo arquivo na pasta `migrations/` com numeração sequencial
2. Siga o padrão: `05_nome_da_migracao.sql`
3. Execute: `node database/migrate.js migrate`

### Backup

Recomenda-se fazer backup regular das migrações e configurações:

```bash
# Backup das migrações
cp -r database/migrations/ backup/migrations-$(date +%Y%m%d)/
```

## Troubleshooting

### Erro de Conexão
- Verifique as variáveis de ambiente
- Confirme se o Supabase está acessível
- Verifique as permissões da service key

### Migração Falhou
- Verifique os logs de erro
- Confirme se a migração anterior foi executada
- Verifique a sintaxe SQL

### Performance
- Monitore o uso de índices
- Verifique queries lentas
- Considere particionamento para tabelas grandes

## Contato

Para dúvidas sobre a estrutura do banco de dados, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.