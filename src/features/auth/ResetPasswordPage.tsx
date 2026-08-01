import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthError, useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Credit } from '@/components/Credit'

/**
 * E-postadaki sıfırlama bağlantısı buraya düşer. Supabase istemcisi
 * `detectSessionInUrl` ile geçici oturumu kurar; burada sadece yeni şifre
 * yazılır.
 */
export function ResetPasswordPage() {
  const { session, updatePassword } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError(t('reset.tooShort'))
      return
    }
    if (password !== repeat) {
      setError(t('reset.mismatch'))
      return
    }

    setError(null)
    setBusy(true)
    try {
      await updatePassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof AuthError ? t(err.key) : t('reset.failed'))
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
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          {t('reset.title')}
        </h1>

        {!session ? (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              {t('reset.expired')}
            </p>
            <Button
              variant="secondary"
              full
              className="mt-5"
              onClick={() => navigate('/giris', { replace: true })}
            >
              {t('login.back')}
            </Button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <TextField
              label={t('reset.new')}
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label={t('reset.repeat')}
              type="password"
              autoComplete="new-password"
              required
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />

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
              {t('reset.submit')}
            </Button>
          </form>
        )}
      </div>

      <Credit className="pt-8" />
    </div>
  )
}
