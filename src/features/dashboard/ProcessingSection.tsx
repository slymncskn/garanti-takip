import { Link } from 'react-router-dom'
import { useOpenReceipts, useRetryReceipt } from '@/hooks/useReceiptStatus'
import { useUploads } from '@/hooks/useUploads'
import { useI18n } from '@/i18n'
import { ListGroup, SectionLabel } from '@/components/ui/List'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'

/**
 * "İşleniyor" bölümü: yükleme kuyruğu ile okunmayı bekleyen fişler tek
 * listede. Eskiden ekranın altında yüzen toast'lar ve ayrı bir kart vardı;
 * ikisi de buraya taşındı, böylece devam eden iş hep aynı yerde duruyor.
 *
 * `parsed` fişler buraya değil, "Onay bekliyor" bölümüne düşer.
 */
export function ProcessingSection() {
  const { data } = useOpenReceipts()
  const { items, dismiss } = useUploads()
  const retry = useRetryReceipt()
  const { t } = useI18n()

  const uploading = items.filter(
    (i) => i.status === 'preparing' || i.status === 'uploading',
  )
  const uploadErrors = items.filter((i) => i.status === 'error')
  const working = (data ?? []).filter(
    (r) => r.status === 'pending' || r.status === 'processing',
  )
  const failed = (data ?? []).filter((r) => r.status === 'failed')

  const total =
    uploading.length + uploadErrors.length + working.length + failed.length
  if (total === 0) return null

  return (
    <section className="mb-[22px]">
      <SectionLabel>{t('dash.processing')}</SectionLabel>

      <ListGroup>
        {uploading.map((item) => (
          <Row
            key={item.id}
            tone="accent"
            title={item.fileName}
            subtitle={t(item.messageKey ?? 'upload.uploading')}
            progress
          />
        ))}

        {working.map((receipt) => (
          <Row
            key={receipt.id}
            tone="soon"
            title={t('receipt.reading')}
            subtitle={`${formatDate(receipt.created_at.slice(0, 10))} · ${t(
              'receipt.readingHint',
            )}`}
          />
        ))}

        {uploadErrors.map((item) => (
          <ErrorRow
            key={item.id}
            title={t('upload.error')}
            description={t(item.messageKey ?? 'upload.failedBody')}
            actions={
              <SmallButton onClick={() => dismiss(item.id)}>
                {t('upload.dismiss')}
              </SmallButton>
            }
          />
        ))}

        {failed.map((receipt) => (
          <ErrorRow
            key={receipt.id}
            title={t('receipt.failed')}
            description={
              receipt.retry_count >= 3
                ? t('receipt.failedGiveUp')
                : t('receipt.failedRetry')
            }
            actions={
              <>
                {receipt.retry_count < 3 && (
                  <SmallButton
                    onClick={() => retry.mutate(receipt.id)}
                    disabled={retry.isPending}
                  >
                    {t('receipt.retry')}
                  </SmallButton>
                )}
                <Link to="/yeni">
                  <SmallButton>{t('receipt.manual')}</SmallButton>
                </Link>
              </>
            }
          />
        ))}
      </ListGroup>
    </section>
  )
}

function Row({
  tone,
  title,
  subtitle,
  progress = false,
}: {
  tone: 'accent' | 'soon'
  title: string
  subtitle: string
  progress?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className={cn(
          'flex size-[34px] shrink-0 items-center justify-center rounded-[11px]',
          tone === 'soon' ? 'bg-soon-soft' : 'bg-accent-soft',
        )}
      >
        <span
          className={cn(
            'size-4 animate-spin rounded-full border-[2.4px] border-ink/15',
            tone === 'soon' ? 'border-t-soon' : 'border-t-ink-soft',
          )}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15.5px] font-medium leading-tight text-ink">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-faint">
          {subtitle}
        </span>
        {progress && (
          <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-ink/[0.07]">
            <span className="block h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </span>
        )}
      </span>
    </div>
  )
}

function ErrorRow({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions: React.ReactNode
}) {
  return (
    <div className="bg-critical-soft/60 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-critical" />
        <p className="text-[15.5px] font-medium text-ink">{title}</p>
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
        {description}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">{actions}</div>
    </div>
  )
}

function SmallButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="press glass-chip min-h-11 rounded-field px-3.5 text-[14px] font-medium text-ink disabled:opacity-50"
    >
      {children}
    </button>
  )
}
