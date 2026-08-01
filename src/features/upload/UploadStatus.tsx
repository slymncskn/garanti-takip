import { useUploads } from '@/hooks/useUploads'
import { useI18n, type DictKey } from '@/i18n'
import { Spinner } from '@/components/ui/Spinner'
import type { UploadItem } from '@/hooks/useUploads'

const labels: Record<UploadItem['status'], DictKey> = {
  preparing: 'upload.preparing',
  uploading: 'upload.uploading',
  done: 'upload.done',
  error: 'upload.error',
}

/**
 * Yükleme kuyruğunun görünen yüzü. İşlem arka planda sürdüğü için kullanıcı
 * bu sırada uygulamada gezinebilir.
 */
export function UploadStatus() {
  const { items, dismiss } = useUploads()
  const { t } = useI18n()

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-40 flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card border border-line bg-surface px-3.5 py-3 shadow-sm"
        >
          {item.status === 'error' ? (
            <span className="size-2 shrink-0 rounded-full bg-critical" />
          ) : item.status === 'done' ? (
            <span className="size-2 shrink-0 rounded-full bg-active" />
          ) : (
            <Spinner className="shrink-0 text-ink-faint" />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">
              {item.fileName}
            </p>
            <p className="truncate text-[13px] text-ink-soft">
              {t(item.messageKey ?? labels[item.status])}
            </p>
          </div>

          {item.status === 'error' && (
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="min-h-11 shrink-0 px-2 text-[13px] font-medium text-ink-soft"
            >
              {t('upload.dismiss')}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
