import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { DictKey } from '@/i18n/dictionary'

/** Hata metnini değil sözlük anahtarını taşır; çeviriyi ekran yapar. */
export class AuthError extends Error {
  readonly key: DictKey

  constructor(key: DictKey) {
    super(key)
    this.name = 'AuthError'
    this.key = key
  }
}

interface AuthState {
  session: Session | null
  user: User | null
  /** İlk oturum okuması bitene kadar true; ekranlar bu sırada boş kalır. */
  loading: boolean
  /** Şifre sıfırlama bağlantısıyla girildiyse true. */
  recovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendResetLink: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') setRecovery(false)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      recovery,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw new AuthError(authKey(error.message))
      },
      async signOut() {
        await supabase.auth.signOut()
      },
      async sendResetLink(email) {
        // BASE_URL sonunda "/" taşır; alt dizinde servis edilen kurulumda
        // dönüş adresi bu öneki içermeli, yoksa bağlantı 404'e düşer.
        const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}sifre-sifirla`
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        )
        if (error) throw new AuthError(authKey(error.message))
      },
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw new AuthError(authKey(error.message))
        setRecovery(false)
      },
    }),
    [session, loading, recovery],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}

/** Supabase'in ham hata metnini sözlük anahtarına eşler. */
function authKey(raw: string): DictKey {
  const message = raw.toLowerCase()
  if (message.includes('invalid login credentials')) return 'auth.badCredentials'
  if (message.includes('email not confirmed')) return 'auth.notConfirmed'
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'auth.rateLimited'
  }
  if (message.includes('password should be at least')) return 'auth.weakPassword'
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'auth.offline'
  }
  return 'auth.generic'
}
