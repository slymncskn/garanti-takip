import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useProductSearch } from '@/hooks/useProducts'
import { ProductCard } from '@/components/ProductCard'
import { EmptyState, ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'

/**
 * Tek alan, yazdıkça sonuç. Arama Türkçe karakter duyarsız:
 * `sofben` yazınca `şofben` de gelir.
 */
export function SearchPage() {
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 300)
  const { data, isLoading, isError, refetch } = useProductSearch(debounced)

  const results = data ?? []
  const searching = debounced.trim() !== ''

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Ürün ara
      </label>
      <input
        id="search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Ürün, marka, satıcı ya da seri no"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="min-h-13 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 placeholder:text-ink-faint focus:border-accent"
      />

      <div className="mt-5">
        {isError ? (
          <ErrorNote
            description="Arama yapılamadı. Bağlantını kontrol edip tekrar dene."
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                className="min-h-11 text-[14px] font-medium text-ink underline underline-offset-4"
              >
                Tekrar dene
              </button>
            }
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title={searching ? 'Eşleşen ürün yok' : 'Ne arıyorsun?'}
            description={
              searching
                ? `“${debounced}” için sonuç bulamadım. Markayı ya da ürünün kısa adını yazmayı dene.`
                : 'Ürün adı, marka, satıcı veya seri numarasıyla arayabilirsin. Türkçe karakterleri yazmasan da bulur.'
            }
          />
        ) : (
          <>
            <p className="tabular mb-3 text-[13px] text-ink-faint">
              {results.length} sonuç
            </p>
            <div className="flex flex-col gap-2">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
