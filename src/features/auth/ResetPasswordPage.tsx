import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'

/**
 * E-postadaki sıfırlama bağlantısı buraya düşer. Supabase istemcisi
 * `detectSessionInUrl` ile geçici oturumu kurar; burada sadece yeni şifre
 * yazılır.
 */
export function ResetPasswordPage() {
  const { session, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    if (password !== repeat) {
      setError('İki şifre birbirini tutmuyor.')
      return
    }

    setError(null)
    setBusy(true)
    try {
      await updatePassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre değiştirilemedi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-paper px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-[24px] font-bold tracking-tight text-ink">
          Yeni şifre belirle
        </h1>

        {!session ? (
          <>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
              Bu bağlantının süresi dolmuş görünüyor. Giriş ekranından yeni bir
              sıfırlama bağlantısı isteyebilirsin.
            </p>
            <Button
              variant="secondary"
              full
              className="mt-5"
              onClick={() => navigate('/giris', { replace: true })}
            >
              Girişe dön
            </Button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <TextField
              label="Yeni şifre"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Yeni şifre (tekrar)"
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
              Şifreyi kaydet
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
