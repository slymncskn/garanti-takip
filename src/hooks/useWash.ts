import { useEffect } from 'react'

/**
 * Arka plan yıkamasının tonunu ekran bazında değiştirir.
 *
 * Camın görünmesi bu yıkamaya bağlı; detay ekranında ürünün durum rengi
 * yıkamayı sürükler (yaklaşan ürün → amber yıkama). Ekrandan çıkınca
 * varsayılana döner.
 */
export function useWash(a?: string | null, b?: string | null): void {
  useEffect(() => {
    if (!a && !b) return

    const root = document.documentElement
    const previousA = root.style.getPropertyValue('--wash-a')
    const previousB = root.style.getPropertyValue('--wash-b')

    if (a) root.style.setProperty('--wash-a', a)
    if (b) root.style.setProperty('--wash-b', b)

    return () => {
      if (previousA) root.style.setProperty('--wash-a', previousA)
      else root.style.removeProperty('--wash-a')
      if (previousB) root.style.setProperty('--wash-b', previousB)
      else root.style.removeProperty('--wash-b')
    }
  }, [a, b])
}
