import { Link } from 'react-router-dom'
import { useOpenReceipts, useRetryReceipt } from '@/hooks/useReceiptStatus'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/format'

/**
 * İşlenmeyi bekleyen ve okunamayan fişler. `parsed` olanlar buraya değil,
 * "Onay bekleyenler" bölümüne düşer — orada ürünleriyle birlikte görünürler.
 */
export function PendingReceipts() {
  const { data } = useOpenReceipts()
  const retry = useRetryReceipt()
  const { t } = useI18n()

  const working = (data ?? []).filter(
    (r) => r.status === 'pending' || r.status === 'processing',
  )
  const failed = (data ?? []).filter((r) => r.status === 'failed')

  if (working.length === 0 && failed.length === 0) return null

  return (
    <section className="mb-7 flex flex-col gap-2">
      {working.map((receipt) => (
        <Card key={receipt.id} className="flex items-center gap-3 px-4 py-3.5">
          <Spinner className="shrink-0 text-ink-faint" />
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-ink">
              {t('receipt.reading')}
            </p>
            <p className="tabular text-[13px] text-ink-faint">
              {formatDate(receipt.created_at.slice(0, 10))} ·{' '}
              {t('receipt.readingHint')}
            </p>
          </div>
        </Card>
      ))}

      {failed.map((receipt) => (
        <Card
          key={receipt.id}
          className="border-critical/25 bg-critical-soft/50 px-4 py-3.5"
        >
          <p className="text-[14px] font-medium text-ink">
            {t('receipt.failed')}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            {receipt.retry_count >= 3
              ? t('receipt.failedGiveUp')
              : t('receipt.failedRetry')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {receipt.retry_count < 3 && (
              <Button
                size="sm"
                variant="secondary"
                disabled={retry.isPending}
                onClick={() => retry.mutate(receipt.id)}
              >
                {t('receipt.retry')}
              </Button>
            )}
            <Link to="/yeni">
              <Button size="sm" variant="ghost">
                {t('receipt.manual')}
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </section>
  )
}
