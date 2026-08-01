# Garanti Takip — Frontend

Fişleri sakla, garanti bitiş tarihlerini takip et, süre dolmadan uyarı al.
Ürün kararları ve sözleşmeler için tek kaynak: [CLAUDE.md](CLAUDE.md).

Backend (Supabase + n8n) kuruludur; bu repo yalnızca PWA'yı içerir.

## Başlarken

```bash
npm install
```

`.env.local` hazır; anon key dolu. Kalan tek boş değer:

| Değişken | Nereden |
|---|---|
| `VITE_N8N_WEBHOOK_SECRET` | n8n'deki `Garanti Webhook Secret` (Header Auth) değeri |

`service_role` anahtarı buraya asla girmez.

```bash
npm run dev
```

Telefondan denemek için `npm run dev` çıktısındaki `Network` adresini kullan
(`server.host` açık). Kamera ve ana ekrana ekleme yalnızca HTTPS ya da
`localhost` üzerinde çalışır; telefonda gerçek testi Cloudflare Pages
önizlemesinde yapmak daha kolay.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Tip kontrolü + üretim derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş çıktıyı servis eder (service worker'ı test etmek için) |
| `npm run lint` | Yalnızca tip kontrolü |
| `npm run icons` | PWA ikonlarını yeniden üretir |
| `npm run gen:types` | Supabase şemasından tipleri yeniden üretir (`supabase login` ister) |

## Yapı

```
src/
  lib/        supabase, n8n, görsel küçültme, biçimlendirme, durum renkleri
  api/        Supabase çağrılarının tamamı burada
  hooks/      TanStack Query sarmalayıcıları, auth, yükleme kuyruğu
  features/   auth · upload · review · dashboard · search · product
  components/ paylaşılan bileşenler + ui/ ilkelleri
```

Kural: Supabase çağrısı yalnızca `src/api/` altında bulunur. Bileşenler
hook'ları, hook'lar `api/`'yi çağırır.

## Deploy — GitHub Pages

Yayın `main` dalına her push'ta [deploy.yml](.github/workflows/deploy.yml) ile
otomatik yapılır. Elle tetiklemek için Actions sekmesinden **Run workflow**.

Tek seferlik kurulum:

1. Depoda **Settings · Pages · Source** → **GitHub Actions**
2. **Settings · Secrets and variables · Actions** altına dört secret ekle:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_N8N_WEBHOOK_URL`,
   `VITE_N8N_WEBHOOK_SECRET`
3. Supabase panel · **Authentication · URL Configuration** → Redirect URLs'e
   `https://<kullanıcı>.github.io/<repo>/**` ekle (şifre sıfırlama için)

Site `https://<kullanıcı>.github.io/<repo>/` adresinde yayınlanır.

### Alt dizin uyarısı

Proje sitesi kök dizinde değil. Taban yol `vite.config.ts` içindeki `BASE`
sabitinden gelir ve workflow onu depo adından geçirir (`VITE_BASE_PATH`).
Depoyu yeniden adlandırırsan kod değişmez, yeni ad kendiliğinden kullanılır.

Özel alan adı alırsan `VITE_BASE_PATH=/` ile derle.

## Uçtan uca test öncesi kalan işler

Bunlar kod işi değil, panellerden yapılır (CLAUDE.md §13):

1. n8n credential'ları (Supabase Service Role, Gemini, Webhook Secret, Gmail)
2. **Supabase'de henüz hiç kullanıcı yok** — panel · Authentication · Users ·
   Add user ile kendine bir hesap oluştur, yoksa giriş yapılamaz
3. İlk gerçek fiş testi

Şema tarafı doğrulandı: RLS üç tabloda da açık (`auth.uid() = user_id`,
`authenticated` rolü), `v_products` `security_invoker=true` ile tanımlı,
`receipts` bucket'ı private ve 10 MB sınırlı, `warranty_end` GENERATED.
