import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { useI18n } from '@/i18n'
import { NavBar } from '@/components/ui/NavBar'
import { BackChevron, ListGroup, ListRow, SectionLabel } from '@/components/ui/List'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Credit } from '@/components/Credit'

const APP_VERSION = '1.0.0'

/**
 * Hesap ekranı. `AppShell`'in üst çubuğundan çıkarılan dil ve çıkış
 * buraya taşındı.
 *
 * Not: hatırlatma eşiklerini (6 ay / 1 ay / 1 hafta) açıp kapatan
 * anahtarlar tasarımda var ama şemada karşılığı yok — `reminders` tablosuna
 * yalnızca n8n yazıyor ve kullanıcı tercihi tutan bir alan bulunmuyor.
 * Backend hazır olduğunda buraya eklenecek.
 */
export function AccountPage() {
  const { user, signOut } = useAuth()
  const { data: products } = useProducts()
  const { t } = useI18n()

  const email = user?.email ?? ''
  const label = email.trim().slice(0, 2).toLocaleUpperCase('tr')

  return (
    <>
      <NavBar
        left={
          <Link
            to="/"
            className="press -mx-2 flex min-h-11 items-center gap-0.5 rounded-full px-2 text-[17px] text-accent"
          >
            <BackChevron />
            {t('nav.summary')}
          </Link>
        }
      />

      <div className="pt-2">
        <h1 className="mb-5 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
          {t('nav.account')}
        </h1>

        <section className="glass-surface mb-[22px] flex items-center gap-3.5 rounded-card p-4">
          <span className="fill-action flex size-13 shrink-0 items-center justify-center rounded-[17px] text-[19px] font-semibold text-white">
            {label}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16.5px] font-semibold text-ink">
              {emailName(email)}
            </p>
            <p className="tabular truncate text-[13px] text-ink-faint">
              {email}
            </p>
          </div>
        </section>

        <section className="mb-[22px]">
          <SectionLabel>{t('account.app')}</SectionLabel>
          <ListGroup>
            <ListRow
              label={t('account.language')}
              trailing={<LanguageToggle />}
            />
            <ListRow
              label={t('account.savedProducts')}
              value={String(products?.length ?? 0)}
              mono
            />
            <ListRow label={t('account.version')} value={APP_VERSION} mono />
          </ListGroup>
        </section>

        <button
          type="button"
          onClick={() => void signOut()}
          className="press flex h-13 w-full items-center justify-center rounded-control text-[16px] font-semibold text-critical backdrop-blur-md"
          style={{
            background: 'rgba(253,232,234,0.70)',
            border: '0.5px solid rgba(215,0,21,0.22)',
          }}
        >
          {t('nav.signOut')}
        </button>

        <Credit className="pt-8" />
      </div>
    </>
  )
}

/** E-postanın yerel kısmından okunabilir bir ad üretir. */
function emailName(email: string): string {
  const local = email.split('@')[0] ?? ''
  if (!local) return '—'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr') + part.slice(1))
    .join(' ')
}
