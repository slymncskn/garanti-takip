import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, type DictKey } from './dictionary'
import {
  readStoredLang,
  setActiveLang,
  STORAGE_KEY,
  type Lang,
} from './locale'

export type { Lang } from './locale'
export type { DictKey } from './dictionary'

export type Translate = (
  key: DictKey,
  params?: Record<string, string | number>,
) => string

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translate
}

const I18nContext = createContext<I18nState | null>(null)

function translate(lang: Lang, key: DictKey, params?: Record<string, string | number>) {
  const text = dictionaries[lang][key] ?? dictionaries.tr[key] ?? key
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const initial = readStoredLang()
    // Biçimlendiriciler modül seviyesindeki dili okuyor; ilk render'dan
    // önce eşitlenmeli.
    setActiveLang(initial)
    return initial
  })

  const setLang = useCallback((next: Lang) => {
    setActiveLang(next)
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* özel sekmede depolama kapalı olabilir, sorun değil */
    }
    document.documentElement.lang = next
  }, [])

  const value = useMemo<I18nState>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nState {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n, I18nProvider içinde kullanılmalı')
  return ctx
}
