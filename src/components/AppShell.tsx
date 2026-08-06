import { createContext, useContext, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UploadSheet } from '@/features/upload/UploadSheet'
import { useUploads } from '@/hooks/useUploads'
import { useOpenReceipts } from '@/hooks/useReceiptStatus'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/**
 * Kabuk. Sticky header ve sağ alt köşedeki FAB kaldırıldı; yerlerine
 * yüzen cam sekme çubuğu geldi. Dil ve çıkış Hesap ekranında.
 */
/** Fiş ekleme sheet'ini kabuk dışından da açabilmek için (ör. boş durum). */
const AddReceiptContext = createContext<() => void>(() => {})

// eslint-disable-next-line react-refresh/only-export-components
export function useAddReceipt(): () => void {
  return useContext(AddReceiptContext)
}

export function AppShell() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Onay ve form ekranlarının kendi alt aksiyon çubuğu var; sekme çubuğu
  // onların üstüne binmesin.
  const showTabBar = !/^\/(onay|yeni)|\/duzenle$/.test(pathname)

  const open = useMemo(() => () => setSheetOpen(true), [])

  return (
    <AddReceiptContext.Provider value={open}>
      <div className="min-h-dvh">
        <main
          className={cn('mx-auto max-w-2xl px-5', showTabBar ? 'pb-26' : 'pb-8')}
        >
          <Outlet />
        </main>

        {showTabBar && <TabBar onAdd={open} addLabel={t('upload.add')} />}

        <UploadSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </div>
    </AddReceiptContext.Provider>
  )
}

function TabBar({
  onAdd,
  addLabel,
}: {
  onAdd: () => void
  addLabel: string
}) {
  const { t } = useI18n()
  const { busy } = useUploads()
  const { data: openReceipts } = useOpenReceipts()

  // Başka ekrandayken işlenen fiş varsa Özet sekmesinde küçük bir nokta.
  const working =
    busy ||
    (openReceipts ?? []).some(
      (r) => r.status === 'pending' || r.status === 'processing',
    )

  return (
    <nav
      aria-label={t('nav.tabs')}
      className="glass-tabbar fixed inset-x-3 z-40 flex h-[66px] items-center justify-around rounded-[33px] px-2"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
    >
      <TabItem to="/" label={t('nav.summary')} badge={working}>
        {({ active }) => (
          <span
            className="block size-5 rounded-full"
            style={{ border: `${active ? 2.6 : 2.2}px solid currentColor` }}
          />
        )}
      </TabItem>

      <TabItem to="/ara" label={t('nav.search')}>
        {({ active }) => (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={active ? 2.2 : 1.9}
            strokeLinecap="round"
            className="size-[21px]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        )}
      </TabItem>

      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel}
        className="press fill-action flex size-[50px] items-center justify-center rounded-[25px] text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="size-[23px]"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </nav>
  )
}

function TabItem({
  to,
  label,
  badge = false,
  children,
}: {
  to: string
  label: string
  badge?: boolean
  children: (state: { active: boolean }) => React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'relative flex min-h-11 w-16 flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-accent' : 'text-ink-faint',
        )
      }
    >
      {({ isActive }) => (
        <>
          {children({ active: isActive })}
          <span className="text-[10.5px] font-semibold leading-none">
            {label}
          </span>
          {badge && (
            <span
              className="absolute right-3 top-0 size-2 rounded-full bg-soon ring-2 ring-white/70"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  )
}
