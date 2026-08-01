import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useConfirmReceipt, useProductsByReceipt } from '@/hooks/useProducts'
import { useReceipt } from '@/hooks/useReceiptStatus'
import { ReceiptViewer } from '@/components/ReceiptViewer'
import { ProductFields } from '@/components/ProductFields'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState, ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton, Spinner } from '@/components/ui/Spinner'
import { emptyDraft, rowToDraft, validateDraft } from '@/lib/draft'
import type { ProductDraft } from '@/types/app'

/**
 * Onay ekranı — sistemin doğruluk güvencesi.
 *
 * Atlanabilir değil: onaylanmayan ürün için hatırlatma maili gitmez. Ama
 * model çoğu zaman doğru okuyacağı için onay tek dokunuşla mümkün olmalı;
 * düzenleme isteğe bağlı kalır.
 */
export function ReviewPage() {
  const { receiptId } = useParams<{ receiptId: string }>()
  const navigate = useNavigate()

  const receipt = useReceipt(receiptId)
  const products = useProductsByReceipt(receiptId)
  const confirm = useConfirmReceipt(receiptId ?? '')

  const [drafts, setDrafts] = useState<ProductDraft[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (products.data && drafts === null) {
      setDrafts(products.data.map(rowToDraft))
    }
  }, [products.data, drafts])

  if (receipt.isLoading || products.isLoading) {
    return <Skeleton className="h-80" />
  }

  if (receipt.isError || !receipt.data) {
    return (
      <ErrorNote description="Bu fişi bulamadım. Ana sayfadan tekrar dene." />
    )
  }

  const status = receipt.data.status

  if (status === 'pending' || status === 'processing') {
    return (
      <EmptyState
        title="Fiş hâlâ okunuyor"
        description="Birkaç dakika sürebilir. Hazır olduğunda ana sayfada onay bekleyenler arasında görünecek."
        action={
          <Link to="/">
            <Button variant="secondary">Ana sayfaya dön</Button>
          </Link>
        }
      />
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title="Fiş okunamadı"
          description="Bu fişten bilgi çıkaramadım. Ürünü elle ekleyebilir ya da fişi tekrar yükleyebilirsin."
          action={
            <Link to="/yeni">
              <Button>Elle ekle</Button>
            </Link>
          }
        />
        <ReceiptViewer
          filePath={receipt.data.file_path}
          fileType={receipt.data.file_type}
        />
      </div>
    )
  }

  const list = drafts ?? []

  function update(index: number, next: ProductDraft) {
    setDrafts((prev) =>
      (prev ?? []).map((item, i) => (i === index ? next : item)),
    )
  }

  function remove(index: number) {
    setDrafts((prev) => (prev ?? []).filter((_, i) => i !== index))
  }

  function add() {
    setDrafts((prev) => [
      ...(prev ?? []),
      emptyDraft(receipt.data?.purchase_date),
    ])
  }

  async function onConfirm() {
    if (list.length === 0) {
      setError('En az bir ürün olmalı.')
      return
    }
    for (const draft of list) {
      const problem = validateDraft(draft)
      if (problem) {
        setError(problem)
        return
      }
    }

    setError(null)
    try {
      await confirm.mutateAsync(list)
      navigate('/', { replace: true })
    } catch {
      setError('Kaydedilemedi. Bağlantını kontrol edip tekrar dene.')
    }
  }

  return (
    <div className="pb-24">
      <header className="mb-5">
        <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
          {status === 'confirmed' ? 'Onaylanmış fiş' : 'Okunanı kontrol et'}
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
          {status === 'confirmed'
            ? 'Bu fiş zaten onaylandı. Ürünleri düzenleyip yeniden kaydedebilirsin.'
            : 'Fişin yanında duruyor. Yanlış okunan bir yer varsa düzelt, doğruysa doğrudan onayla.'}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start">
        <div className="md:sticky md:top-20">
          <ReceiptViewer
            filePath={receipt.data.file_path}
            fileType={receipt.data.file_type}
          />
        </div>

        <div className="flex flex-col gap-4">
          {list.length === 0 && (
            <EmptyState
              title="Bu fişte ürün yok"
              description="Fişten ürün çıkaramadım. Aşağıdan elle ekleyebilirsin."
            />
          )}

          {list.map((draft, index) => (
            <Card key={draft.id ?? `new-${index}`} className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="tabular text-[13px] font-medium text-ink-faint">
                  Ürün {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="min-h-11 px-2 text-[13px] font-medium text-ink-faint transition-colors hover:text-critical"
                >
                  Kaldır
                </button>
              </div>

              <ProductFields
                draft={draft}
                onChange={(next) => update(index, next)}
                showMerchant
                merchant={receipt.data?.merchant}
              />
            </Card>
          ))}

          <Button variant="secondary" full onClick={add}>
            Ürün ekle
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-critical-soft px-3 py-2.5 text-[14px] text-critical"
        >
          {error}
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper/95 backdrop-blur safe-bottom">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-3">
          <p className="tabular flex-1 text-[13px] text-ink-faint">
            {list.length} ürün
          </p>
          <Button
            size="lg"
            onClick={() => void onConfirm()}
            disabled={confirm.isPending}
            className="min-w-40"
          >
            {confirm.isPending && <Spinner />}
            Onayla
          </Button>
        </div>
      </div>
    </div>
  )
}
