import { useSignedUrl } from '@/hooks/useReceiptStatus'
import { Skeleton } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

/**
 * Fişin kendisi. Kullanıcı okunan bilgiyi orijinalle karşılaştırabilmeli —
 * onay ekranının doğruluk güvencesi buna dayanıyor. URL imzalı, 1 saat geçerli.
 */
export function ReceiptViewer({
  filePath,
  fileType,
  className,
}: {
  filePath: string | null | undefined
  fileType?: string | null
  className?: string
}) {
  const { data: url, isLoading, isError } = useSignedUrl(filePath)

  if (!filePath) return null

  if (isLoading) {
    return <Skeleton className={cn('h-64 w-full', className)} />
  }

  if (isError || !url) {
    return (
      <div
        className={cn(
          'rounded-card border border-line bg-sunken px-4 py-6 text-center text-[14px] text-ink-soft',
          className,
        )}
      >
        Fiş görüntülenemedi. Sayfayı yenilemeyi dene.
      </div>
    )
  }

  const isPdf = fileType === 'application/pdf' || filePath.endsWith('.pdf')

  if (isPdf) {
    return (
      <div className={cn('overflow-hidden rounded-card border border-line', className)}>
        <object data={url} type="application/pdf" className="h-80 w-full">
          <div className="px-4 py-6 text-center">
            <p className="text-[14px] text-ink-soft">
              PDF burada gösterilemiyor.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[14px] font-medium text-accent underline underline-offset-4"
            >
              Yeni sekmede aç
            </a>
          </div>
        </object>
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'block overflow-hidden rounded-card border border-line bg-sunken',
        className,
      )}
      aria-label="Fişi büyüt"
    >
      <img
        src={url}
        alt="Yüklenen fiş"
        loading="lazy"
        className="max-h-[70vh] w-full object-contain"
      />
    </a>
  )
}
