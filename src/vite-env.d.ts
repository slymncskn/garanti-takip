/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // n8n bilgileri istemciye hiç girmez; bildirim `notify-receipt`
  // Edge Function'ı üzerinden gider, sır Supabase secret'ında durur.
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
