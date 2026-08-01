import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { UploadButton } from '@/features/upload/UploadButton'
import { UploadStatus } from '@/features/upload/UploadStatus'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/i18n'
import { LanguageToggle } from '@/components/LanguageToggle'
import { cn } from '@/lib/cn'

export function AppShell() {
  const { signOut } = useAuth()
  const { t } = useI18n()
  const { pathname } = useLocation()

  // Onay ve form ekranlarının kendi alt aksiyonu var; yükleme düğmesi
  // onların üstüne binmesin.
  const showUpload = !/^\/(onay|yeni)|\/duzenle$/.test(pathname)

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur safe-top">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="min-w-0 leading-none">
            <span className="block font-display text-[17px] font-bold tracking-tight text-ink">
              Garanti<span className="text-ink-faint">Takip</span>
            </span>
            <span className="mt-1 block truncate text-[10px] font-medium tracking-wide text-ink-faint">
              {t('app.credit')}
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <LanguageToggle className="mr-1" />

            <IconLink to="/ara" label={t('nav.search')}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="size-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </IconLink>

            <button
              type="button"
              onClick={() => void signOut()}
              aria-label={t('nav.signOut')}
              className="flex size-11 items-center justify-center rounded-xl text-ink-faint transition-colors hover:bg-sunken hover:text-ink"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M15 17l5-5-5-5" />
                <path d="M20 12H9" />
                <path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-5">
        <Outlet />
      </main>

      <UploadStatus />
      {showUpload && <UploadButton />}
    </div>
  )
}

function IconLink({
  to,
  label,
  children,
}: {
  to: string
  label: string
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'flex size-11 items-center justify-center rounded-xl transition-colors',
          isActive
            ? 'bg-sunken text-ink'
            : 'text-ink-faint hover:bg-sunken hover:text-ink',
        )
      }
    >
      {children}
    </NavLink>
  )
}
