import { useState } from 'react'
import { AuthError, useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { ListGroup } from '@/components/ui/List'
import { ListField } from '@/components/ui/ListField'
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
    <div className="flex min-h-dvh flex-col px-5 py-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-[20px] shadow-[0_12px_26px_rgba(36,65,63,0.32)]"
          />
          <h1 className="mt-4 text-[30px] font-bold leading-none tracking-[-0.035em] text-ink">
            Garanti<span className="text-ink-faint">Takip</span>
          </h1>
          <p className="mt-2.5 text-[15.5px] leading-relaxed text-ink-soft">
            {mode === 'signin' ? t('login.tagline') : t('login.resetTagline')}
          </p>
        </div>

        {sent ? (
          <div className="glass-surface rounded-card p-5 text-center">
            <p className="text-[16px] font-semibold text-ink">
              {t('login.sentTitle')}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              {t('login.sentBody', { email })}
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setMode('signin')
              }}
              className="press mt-4 min-h-11 text-[15px] font-medium text-accent"
            >
              {t('login.back')}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <ListGroup>
              <ListField
                label={t('login.email')}
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                placeholder="ornek@posta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {mode === 'signin' && (
                <ListField
                  label={t('login.password')}
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••"
                  className="tracking-[0.14em]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </ListGroup>

            {error && (
              <p
                role="alert"
                className="rounded-[14px] bg-critical-soft/80 px-4 py-3 text-[14px] text-critical backdrop-blur-md"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="press fill-action flex h-[54px] w-full items-center justify-center gap-2 rounded-control text-[17px] font-semibold text-white disabled:opacity-60"
            >
              {busy && <Spinner className="text-white" />}
              {mode === 'signin' ? t('login.submit') : t('login.sendLink')}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'reset' : 'signin')
                setError(null)
              }}
              className="press min-h-11 text-[14.5px] font-medium text-accent"
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
