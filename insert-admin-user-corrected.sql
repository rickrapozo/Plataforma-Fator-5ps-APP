-- Script corrigido para inserir usuário admin na tabela users
-- Corrige os nomes das colunas conforme o schema atual

-- Inserir usuário admin na tabela users
INSERT INTO users (
    id,
    email,
    name,
    role,
    subscription,
    subscription_status,
    permissions,
    created_at,
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', 'Administrador'),
    'admin',
    'prosperous',
    'active',
    ARRAY['admin', 'premium', 'basic'],
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'rickrapozo@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    subscription = EXCLUDED.subscription,
    subscription_status = EXCLUDED.subscription_status,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- Inserir progresso inicial do usuário
INSERT INTO user_progress (
    user_id,
    level,
    xp,
    streak,
    longest_streak,
    total_days,
    badges
)
SELECT 
    id,
    10,
    5000,
    30,
    30,
    100,
    ARRAY['early_adopter', 'streak_master', 'level_10']
FROM auth.users 
WHERE email = 'rickrapozo@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    level = EXCLUDED.level,
    xp = EXCLUDED.xp,
    streak = EXCLUDED.streak,
    longest_streak = EXCLUDED.longest_streak,
    updated_at = NOW();

-- Verificar se o usuário foi inserido corretamente
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.subscription,
    u.subscription_status,
    up.level,
    up.xp,
    up.streak
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.email = 'rickrapozo@gmail.com';