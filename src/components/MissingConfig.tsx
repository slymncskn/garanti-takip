/**
 * `.env.local` doldurulmadan uygulama açılırsa beyaz ekran yerine ne
 * yapılacağını söyleyen bir ekran çıkar.
 */
export function MissingConfig() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-6">
        <h1 className="font-display text-[20px] font-bold text-ink">
          Kurulum yarım kalmış
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          Supabase bilgileri tanımlı değil. Proje kökündeki{' '}
          <code className="tabular text-[13px]">.env.example</code> dosyasını{' '}
          <code className="tabular text-[13px]">.env.local</code> olarak
          kopyalayıp iki değeri doldur, sonra sunucuyu yeniden başlat.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[14px] text-ink-soft">
          <li>
            <code className="tabular text-[13px] text-ink">
              VITE_SUPABASE_URL
            </code>{' '}
            — Supabase panel · Project Settings · API
          </li>
          <li>
            <code className="tabular text-[13px] text-ink">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            — aynı sayfada, anon public
          </li>
        </ul>
      </div>
    </div>
  )
}
