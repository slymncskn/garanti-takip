import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthError, useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { ListGroup } from '@/components/ui/List'
import { ListField } from '@/components/ui/ListField'
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
    <div className="flex min-h-dvh flex-col px-5 py-6">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-ink">
          {t('reset.title')}
        </h1>

        {!session ? (
          <>
            <p className="mt-2.5 text-[15.5px] leading-relaxed text-ink-soft">
              {t('reset.expired')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/giris', { replace: true })}
              className="press glass-surface mt-5 flex h-13 w-full items-center justify-center rounded-control text-[16px] font-semibold text-ink"
            >
              {t('login.back')}
            </button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <ListGroup>
              <ListField
                label={t('reset.new')}
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••"
                className="tracking-[0.14em]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ListField
                label={t('reset.repeat')}
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••"
                className="tracking-[0.14em]"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              />
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
              {t('reset.submit')}
            </button>
          </form>
        )}
      </div>

      <Credit className="pt-8" />
    </div>
  )
}
