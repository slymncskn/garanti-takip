export type Lang = 'tr' | 'en'

export const STORAGE_KEY = 'garanti-takip:lang'

/**
 * Etkin dil, modül seviyesinde de tutulur.
 *
 * Sebep: `lib/format.ts` içindeki tarih/para/"42 gün kaldı" biçimlendiricileri
 * bileşen değil, saf fonksiyon. Hepsine dil parametresi geçirmek yerine
 * sağlayıcı bu değeri güncelliyor; fonksiyonlar render sırasında çağrıldığı
 * için dil değişince doğru sonucu üretiyorlar.
 */
let activeLang: Lang = 'tr'

export function getLang(): Lang {
  return activeLang
}

export function setActiveLang(lang: Lang): void {
  activeLang = lang
}

export function readStoredLang(): Lang {
  if (typeof localStorage === 'undefined') return 'tr'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'tr' ? stored : 'tr'
}

/** Intl için tam yerel ad. */
export function intlLocale(lang: Lang = activeLang): string {
  return lang === 'en' ? 'en-GB' : 'tr-TR'
}
