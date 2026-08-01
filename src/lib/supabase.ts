import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlı değil. ' +
      '.env.example dosyasını .env.local olarak kopyalayıp doldur.',
  )
}

/**
 * Tek Supabase istemcisi. Yalnızca anon key kullanılır; service_role anahtarı
 * bu pakete asla girmez. Yetki denetimi tamamen RLS'te.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

/** Oturumdaki kullanıcının id'si; yoksa hata fırlatır. */
export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Error('Oturum bulunamadı, tekrar giriş yapman gerekiyor.')
  }
  return data.user.id
}
