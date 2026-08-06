import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useProductSearch } from '@/hooks/useProducts'
import { useI18n } from '@/i18n'
import { ProductRow } from '@/components/ProductRow'
import { ListGroup, SectionLabel } from '@/components/ui/List'
import { ErrorNote } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'

const RECENT_KEY = 'garanti:recent-searches'
const RECENT_MAX = 5

/**
 * Tek alan, yazdıkça sonuç. Arama Türkçe karakter duyarsız:
 * `sofben` yazınca `şofben` de gelir.
 */
export function SearchPage() {
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 300)
  const { data, isLoading, isError, refetch } = useProductSearch(debounced)
  const { t } = useI18n()
  const [recent, setRecent] = useState<string[]>(readRecent)

  const results = data ?? []
  const searching = debounced.trim() !== ''

  const remember = useCallback((value: string) => {
    const clean = value.trim()
    if (clean.length < 2) return
    setRecent((prev) => {
      const next = [clean, ...prev.filter((x) => x !== clean)].slice(
        0,
        RECENT_MAX,
      )
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* özel sekmede depolama kapalı olabilir */
      }
      return next
    })
  }, [])

  // Sonuç dönen aramaları hatırla — boşa çıkanları değil.
  useEffect(() => {
    if (searching && results.length > 0) remember(debounced)
  }, [searching, results.length, debounced, remember])

  return (
    <div className="pt-4">
      <h1 className="mb-4 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
        {t('nav.search')}
      </h1>

      <label htmlFor="search" className="sr-only">
        {t('search.label')}
      </label>
      <div className="glass-surface flex min-h-11 items-center gap-2 rounded-[15px] px-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          className="size-[17px] shrink-0 text-ink-faint"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-ink caret-accent placeholder:text-ink-hint focus:outline-none"
        />
      </div>

      <div className="mt-5">
        {isError ? (
          <ErrorNote
            title={t('common.error')}
            description={t('search.error')}
            action={
              <button
                type="button"
                onClick={() => void refetch()}
                className="press glass-chip min-h-11 rounded-field px-4 text-[14px] font-medium text-ink"
              >
                {t('dash.retry')}
              </button>
            }
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="tabular mb-2 text-[12.5px] font-medium uppercase tracking-wide text-ink-faint">
              {t('search.results', { count: results.length })}
            </p>
            <ListGroup>
              {results.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ListGroup>
          </>
        ) : searching ? (
          <p className="px-2 py-8 text-center text-[15px] leading-relaxed text-ink-soft">
            {t('search.emptyBody', { term: debounced })}
          </p>
        ) : recent.length > 0 ? (
          <>
            <SectionLabel>{t('search.recent')}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {recent.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTerm(item)}
                  className="press glass-chip min-h-11 rounded-full px-3.5 text-[14px] text-ink"
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="px-2 py-8 text-center text-[15px] leading-relaxed text-ink-soft">
            {t('search.idleBody')}
          </p>
        )}
      </div>
    </div>
  )
}

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}
