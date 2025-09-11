/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_N8N_WEBHOOK_URL: string
  readonly VITE_RATE_LIMIT_MAX_REQUESTS: string
  readonly VITE_RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: string
  readonly NODE_ENV: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}