import { useDownloadUrl } from '@/hooks/useReceiptStatus'
import { useI18n } from '@/i18n'
import { buttonStyles } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ProductRow } from '@/types/app'

/**
 * Fişin özgün dosyasını indirir.
 *
 * Gerçek bir `<a href>` — düğme değil. Bağlantı sayfa açılırken hazırlandığı
 * için tıklama anında ağ isteği yok; iOS'ta "kullanıcı hareketi" kuralına
 * takılmadan indirme başlıyor.
 */
export function DownloadReceiptButton({ product }: { product: ProductRow }) {
  const { t } = useI18n()
  const fileName = downloadName(product)
  const { data: url, isLoading, isError } = useDownloadUrl(
    product.file_path,
    fileName,
  )

  if (!product.file_path) return null

  const label = (
    <>
      <DownloadIcon />
      {t('product.download')}
    </>
  )

  if (isError) {
    return (
      <span
        role="status"
        title={t('product.downloadError')}
        className={buttonStyles({ variant: 'secondary', className: 'opacity-50' })}
      >
        {label}
      </span>
    )
  }

  if (isLoading || !url) {
    return (
      <span
        aria-hidden="true"
        className={buttonStyles({ variant: 'secondary', className: 'opacity-60' })}
      >
        <Spinner className="text-ink-faint" />
      </span>
    )
  }

  return (
    <a
      href={url}
      download={fileName}
      aria-label={t('product.downloadAria')}
      className={buttonStyles({ variant: 'secondary' })}
    >
      {label}
    </a>
  )
}

/**
 * İndirilen dosyanın adı. Türkçe harfler ASCII'ye indirgeniyor — dosya adı
 * her işletim sisteminde ve `Content-Disposition` başlığında sorunsuz dursun.
 */
function downloadName(product: ProductRow): string {
  const extension = product.file_path?.split('.').pop()?.toLowerCase() || 'jpg'

  const base = (product.name || product.merchant || 'fis')
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  return `fis-${base || 'kayit'}-${product.purchase_date}.${extension}`
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  )
}
