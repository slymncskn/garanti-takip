import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/hooks/useProducts'
import { useI18n } from '@/i18n'
import { ProductFields } from '@/components/ProductFields'
import { Button } from '@/components/ui/Button'
import { ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton, Spinner } from '@/components/ui/Spinner'
import { emptyDraft, rowToDraft, validateDraft } from '@/lib/draft'
import type { ProductDraft } from '@/types/app'

/**
 * Hem elle ürün ekleme (`/yeni`, fişsiz — `receipt_id` NULL) hem de mevcut
 * ürünü düzenleme (`/urun/:id/duzenle`) aynı formu kullanır.
 */
export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const existing = useProduct(id)
  const create = useCreateProduct()
  const update = useUpdateProduct(id ?? '')
  const { t } = useI18n()

  const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft())
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(!isEdit)

  useEffect(() => {
    if (isEdit && existing.data && !ready) {
      setDraft(rowToDraft(existing.data))
      setReady(true)
    }
  }, [isEdit, existing.data, ready])

  if (isEdit && existing.isLoading) return <Skeleton className="h-96" />

  if (isEdit && (existing.isError || (existing.isSuccess && !existing.data))) {
    return (
      <ErrorNote title={t('common.error')} description={t('form.notFound')} />
    )
  }

  const busy = create.isPending || update.isPending

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const problem = validateDraft(draft)
    if (problem) {
      setError(t(problem))
      return
    }

    setError(null)
    try {
      if (isEdit && id) {
        await update.mutateAsync(draft)
        navigate(`/urun/${id}`, { replace: true })
      } else {
        const newId = await create.mutateAsync(draft)
        navigate(`/urun/${newId}`, { replace: true })
      }
    } catch {
      setError(t('form.saveFailed'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 pb-8">
      <header>
        <h1 className="font-display text-[22px] font-bold tracking-tight text-ink">
          {isEdit ? t('form.editTitle') : t('form.newTitle')}
        </h1>
        {!isEdit && (
          <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
            {t('form.newSubtitle')}
          </p>
        )}
      </header>

      <ProductFields draft={draft} onChange={setDraft} />

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-critical-soft px-3 py-2.5 text-[14px] text-critical"
        >
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="lg" disabled={busy} className="flex-1">
          {busy && <Spinner />}
          {t('form.save')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => navigate(-1)}
        >
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  )
}
