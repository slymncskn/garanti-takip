import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/hooks/useProducts'
import { useI18n, type DictKey } from '@/i18n'
import { ProductFields } from '@/components/ProductFields'
import { NavBar, NavAction } from '@/components/ui/NavBar'
import { ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { emptyDraft, rowToDraft, validateDraft } from '@/lib/draft'
import type { ProductDraft } from '@/types/app'

/**
 * Hem elle ürün ekleme (`/yeni`, fişsiz — `receipt_id` NULL) hem de mevcut
 * ürünü düzenleme (`/urun/:id/duzenle`) aynı formu kullanır.
 * Kaydet/İptal nav bar'da; alt düğme çifti kaldırıldı.
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
  const [errorKey, setErrorKey] = useState<DictKey | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [ready, setReady] = useState(!isEdit)

  useEffect(() => {
    if (isEdit && existing.data && !ready) {
      setDraft(rowToDraft(existing.data))
      setReady(true)
    }
  }, [isEdit, existing.data, ready])

  const busy = create.isPending || update.isPending

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const problem = validateDraft(draft)
    if (problem) {
      setErrorKey(problem)
      return
    }

    setErrorKey(null)
    setSaveError(null)
    try {
      if (isEdit && id) {
        await update.mutateAsync(draft)
        navigate(`/urun/${id}`, { replace: true })
      } else {
        const newId = await create.mutateAsync(draft)
        navigate(`/urun/${newId}`, { replace: true })
      }
    } catch {
      setSaveError(t('form.saveFailed'))
    }
  }

  if (isEdit && existing.isLoading) {
    return (
      <>
        <NavBar title={t('form.editTitle')} />
        <Skeleton className="mt-4 h-96" />
      </>
    )
  }

  if (isEdit && (existing.isError || (existing.isSuccess && !existing.data))) {
    return (
      <>
        <NavBar title={t('form.editTitle')} />
        <div className="pt-4">
          <ErrorNote
            title={t('common.error')}
            description={t('form.notFound')}
          />
        </div>
      </>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <NavBar
        left={
          <NavAction onClick={() => navigate(-1)}>
            {t('form.cancel')}
          </NavAction>
        }
        title={isEdit ? t('form.editTitle') : t('form.newTitle')}
        right={
          <NavAction type="submit" strong disabled={busy}>
            {t('form.save')}
          </NavAction>
        }
      />

      <div className="pt-4">
        {!isEdit && (
          <p className="mb-4 px-1 text-[13px] leading-relaxed text-ink-faint">
            {t('form.newSubtitle')}
          </p>
        )}

        <ProductFields
          draft={draft}
          onChange={setDraft}
          errorKey={errorKey}
        />

        {saveError && (
          <p
            role="alert"
            className="mt-4 rounded-field bg-critical-soft px-3 py-2.5 text-[14px] text-critical"
          >
            {saveError}
          </p>
        )}
      </div>
    </form>
  )
}
