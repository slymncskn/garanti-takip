import { useState } from 'react'
import { AuthError, useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Credit } from '@/components/Credit'

type Mode = 'signin' | 'reset'

/** Kayıt ekranı yok — kullanıcı Supabase panelinden elle oluşturuluyor. */
export function LoginPage() {
  const { signIn, sendResetLink } = useAuth()
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await sendResetLink(email)
        setSent(true)
      }
    } catch (err) {
      setError(err instanceof AuthError ? t(err.key) : t('auth.generic'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper px-5 py-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">
            Garanti<span className="text-ink-faint">Takip</span>
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {mode === 'signin' ? t('login.tagline') : t('login.resetTagline')}
          </p>
        </div>

        {sent ? (
          <div className="rounded-card border border-line bg-surface p-5">
            <p className="font-display text-[16px] font-semibold text-ink">
              {t('login.sentTitle')}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              {t('login.sentBody', { email })}
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              full
              onClick={() => {
                setSent(false)
                setMode('signin')
              }}
            >
              {t('login.back')}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label={t('login.email')}
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode === 'signin' && (
              <TextField
                label={t('login.password')}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-critical-soft px-3 py-2.5 text-[14px] text-critical"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" full disabled={busy}>
              {busy && <Spinner />}
              {mode === 'signin' ? t('login.submit') : t('login.sendLink')}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'reset' : 'signin')
                setError(null)
              }}
              className="min-h-11 text-[14px] font-medium text-ink-soft underline-offset-4 hover:underline"
            >
              {mode === 'signin' ? t('login.forgot') : t('login.back')}
            </button>
          </form>
        )}
      </div>

      <Credit className="pt-8" />
    </div>
  )
}
