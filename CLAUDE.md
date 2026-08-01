# Garanti Takip — Proje Brief'i

Bu dosya projenin tek kaynak referansıdır. Backend (Supabase + n8n) **kurulu ve çalışır durumdadır**. Bu projede yazılacak olan şey **frontend'dir**.

---

## 1. Amaç

Satın alınan ürünlerin fişlerini/faturalarını dijital olarak saklamak, garanti bitiş tarihlerini takip etmek ve süre dolmadan önce uyarı almak.

Kullanıcı fişin fotoğrafını çeker veya PDF'ini yükler; sistem fişi otomatik okuyup ürünleri çıkarır; kullanıcı çıkan bilgiyi onaylar; garanti bitişine 6 ay / 3 ay / 1 ay / 1 hafta kala otomatik e-posta gelir.

**Kullanıcı sayısı:** Tek kişi (kendi kullanımı). Ancak veri modeli ve güvenlik katmanı çok kullanıcılı olacak şekilde kurulmuştur; bu varsayımı bozma.

---

## 2. Sistem mimarisi

```
┌─────────────────────────┐
│  PWA (bu repo)          │
│  Cloudflare Pages       │
└───────┬─────────────┬───┘
        │             │
        │ anon key    │ POST (fire-and-forget)
        │ + RLS       │ + x-garanti-secret header
        ▼             ▼
┌──────────────────┐  ┌────────────────────────┐
│   Supabase       │  │   n8n (VPS)            │
│   Postgres       │◄─┤   • Fiş İşleme (OCR)   │
│   Storage        │  │   • Hatırlatma Maili   │
│   Auth           │  │   service_role ile      │
└──────────────────┘  └───────────┬────────────┘
                                  │
                        Gemini API │ Gmail API
```

**Rol dağılımı — buna sadık kal:**

| Katman | Sorumluluk |
|---|---|
| Frontend | Auth, dosya yükleme, CRUD, arama, listeleme. Supabase ile **doğrudan** konuşur. |
| n8n | Yalnızca asenkron işler: OCR ve zamanlanmış e-posta. |
| Supabase | Veri, dosya, kimlik doğrulama, yetkilendirme (RLS). |

**Frontend, okuma/yazma işlerini n8n üzerinden geçirmez.** n8n'e gönderilen tek istek, "yeni fiş yüklendi, işleyebilirsin" bildirimidir ve bu istek başarısız olsa bile veri kaybı olmaz (n8n'in saatlik yedek tetikleyicisi bekleyen fişleri zaten toplar).

---

## 3. Veritabanı şeması

Proje ref: `ycvzelwoouxkxljmkzcy` → `https://ycvzelwoouxkxljmkzcy.supabase.co`

### `receipts` — yüklenen fiş/fatura

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → auth.users | |
| `file_path` | text | Storage yolu, `{user_id}/{dosya}` deseninde |
| `file_type` | text | MIME tipi |
| `merchant` | text | OCR'dan gelir |
| `purchase_date` | date | OCR'dan gelir |
| `total_amount` | numeric(12,2) | |
| `currency` | text | varsayılan `TRY` |
| `status` | text | `pending` / `processing` / `parsed` / `confirmed` / `failed` |
| `raw_ocr` | jsonb | Ham model çıktısı, hata ayıklama için |
| `error_message` | text | |
| `retry_count` | int | 3'e ulaşınca n8n tekrar denemez |
| `created_at`, `processed_at` | timestamptz | |

### `products` — fişten çıkan ürünler

Bir fişte birden fazla ürün olabilir.

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid PK | |
| `receipt_id` | uuid → receipts | Elle eklenen üründe NULL olabilir |
| `user_id` | uuid → auth.users | |
| `name` | text NOT NULL | |
| `brand`, `category`, `serial_number` | text | |
| `price` | numeric(12,2) | |
| `purchase_date` | date NOT NULL | |
| `warranty_months` | int | varsayılan **24**, 0–240 arası |
| `warranty_end` | date | **GENERATED — asla yazma.** `purchase_date + warranty_months` |
| `notes` | text | |
| `is_confirmed` | boolean | varsayılan `false` |
| `created_at`, `updated_at` | timestamptz | `updated_at` trigger ile otomatik |

> ⚠️ `warranty_end` hesaplanan bir kolondur. INSERT/UPDATE gövdesine dahil edersen Postgres hata verir.

> ⚠️ `is_confirmed = false` olan ürünler için **hatırlatma maili gitmez**. Onay adımı sistemin doğruluk güvencesidir, isteğe bağlı bir süs değildir.

### `reminders` — gönderilmiş uyarılar

`(product_id, threshold)` benzersizdir. `threshold`: `6m` / `3m` / `1m` / `1w` / `expired`.
Bu tabloya **yalnızca n8n yazar**; frontend sadece okuyabilir.

### `v_products` — arayüzün ana veri kaynağı

`products` + `receipts` join'i, üzerine iki hesaplanmış alan:

- `days_left` — bitişe kalan gün (negatif olabilir)
- `warranty_status` — `expired` (<0) / `critical` (≤7) / `warning` (≤30) / `soon` (≤90) / `active`

Ayrıca `merchant`, `file_path`, `receipt_status` alanlarını taşır. **Listeleme ve detay ekranlarında bu view'ı kullan**, `products` tablosunu değil. Yazma işlemleri `products` tablosuna yapılır.

### `search_products(q text)`

Türkçe karakter duyarsız arama (`unaccent` tabanlı). `sofben` ↔ `şofben`, `ISITICI` ↔ `ısıtıcı` eşleşir. Ürün adı, marka, satıcı ve seri numarasında arar, `warranty_end` artan sırada döner. `v_products` ile aynı şekli döndürür.

```js
const { data } = await supabase.rpc('search_products', { q: term })
```

Boş/`null` `q` tüm kayıtları döndürür.

---

## 4. Güvenlik modeli

- Üç tabloda da **RLS açık**. Politika: `auth.uid() = user_id`.
- Frontend **yalnızca anon key** kullanır. `service_role` anahtarı frontend koduna, `.env` dosyasına veya repoya **asla girmez** — o yalnızca n8n'de durur.
- `user_id` alanını INSERT sırasında istemci gönderir; RLS `with check` ile doğrular. Başkasının `user_id`'si ile yazma denemesi veritabanı seviyesinde reddedilir.
- Kayıt olma (sign up) Supabase panelinden kapatılmıştır. Uygulamada **kayıt ekranı yapma**, yalnızca giriş ve şifre sıfırlama.

---

## 5. Storage

- Bucket: `receipts`, **private**.
- Limit: 10 MB. İzinli tipler: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `application/pdf`.
- **Dosya yolu deseni zorunlu:** `{user_id}/{timestamp}-{rastgele}.{uzantı}`. Storage RLS politikası ilk klasör adının `auth.uid()` ile eşleşmesini şart koşar; başka desen kullanırsan yükleme reddedilir.
- Dosyaları göstermek için `createSignedUrl(path, 3600)` kullan. Public URL yok.

**Yüklemeden önce görselleri küçült.** Telefon fotoğrafları 3–5 MB gelir ve ücretsiz depolama kotasını hızla tüketir. Canvas ile uzun kenarı 1600 px'e indir, JPEG kalite ~0.85. OCR doğruluğu bu boyutta düşmez. PDF'lere dokunma.

---

## 6. n8n sözleşmesi

**Frontend n8n'i doğrudan çağırmaz.** Bildirim `notify-receipt` Edge Function'ı üzerinden gider:

```
Frontend  → supabase.functions.invoke('notify-receipt', { body: { receipt_id } })
Function  → POST https://n8n.srv1508998.hstgr.cloud/webhook/receipt-uploaded
            Content-Type: application/x-www-form-urlencoded
            Body: secret=<N8N_WEBHOOK_SECRET>&receipt_id=<uuid>
```

> ⚠️ **Neden röle var:** Kullanıcının ağında `hstgr.cloud` alan adı **SNI seviyesinde engelli** — TLS el sıkışmasında alan adını gören ara katman bağlantıyı RST ile kesiyor. Aynı IP'ye farklı SNI ile TLS kuruluyor, düz HTTP çalışıyor; engellenen yalnızca bu alan adı. Yani tarayıcıdan n8n'e ulaşmanın yolu yok. Edge Function Supabase altyapısında çalıştığı için etkilenmiyor.
>
> Yan fayda: webhook sırrı artık istemci paketinde değil. `N8N_WEBHOOK_URL` ve `N8N_WEBHOOK_SECRET` Supabase panelinde **Edge Functions · Secrets** altında tutulur.

> ⚠️ n8n tarafında webhook node'u `authentication: none` ile çalışır; `onlyRunIf` ifadesi gövdedeki `secret` alanını doğrular, eşleşmeyen istek execution oluşturmadan 200 alır. **Özel başlıkla kimlik doğrulamaya geri dönme** — tarayıcıdan çağrılırsa OPTIONS ön kontrolü özel başlık taşımaz, n8n isteği reddeder ve asıl POST hiç gönderilmez; sessizce başarısız olur.

Davranış kuralları:

1. Bu istek **fire-and-forget**'tir. Yanıtı bekleme, hatasını kullanıcıya gösterme, `catch` içinde sessizce yut. Webhook düşse bile n8n saatlik olarak `status='pending'` kayıtları tarar.
2. Çağrı sırası önemli: önce Storage'a yükle → sonra `receipts` satırını `status='pending'` ile oluştur → **sonra** webhook'u çağır. Sıra bozulursa n8n olmayan bir dosyayı indirmeye çalışır.
3. Webhook gövdesindeki `receipt_id` şu an bilgi amaçlıdır; n8n bekleyen tüm kayıtları işler.

**Durum akışı:** `pending` → `processing` → `parsed` → (kullanıcı onaylar) → `confirmed`. Hata olursa `failed` ve `retry_count` artar.

Frontend, yükleme sonrası `status` alanını izlemelidir (aşağıya bakınız).

---

## 7. Teknoloji ve mimari kararlar

**Yığın:** Vite + React + TypeScript + Tailwind CSS
**Veri katmanı:** `@supabase/supabase-js` + TanStack Query
**PWA:** `vite-plugin-pwa` (autoUpdate)
**Deploy hedefi:** GitHub Pages (SPA, statik build, GitHub Actions ile)

**Neden bu seçimler:** Alan adı henüz alınmadı, uygulama `*.github.io/{repo}/` altında çalışacak. iOS Safari'de ana ekrana eklenebilmesi için manifest ve service worker doğru kurulmalı.

> ⚠️ GitHub Pages proje sitesi **kök dizinde değil, alt dizinde** servis edilir. Buna bağlı dört yer birbirini tutmak zorundadır: `vite.config.ts` içindeki `base`, manifest'teki `start_url` ve `scope`, `BrowserRouter` `basename`'i, ve şifre sıfırlamadaki `redirectTo`. Hepsi tek kaynaktan (`BASE` / `import.meta.env.BASE_URL`) türetilir; elle sabit yol yazma.

> GitHub Pages'te sunucu tarafı yönlendirme yok. Derleme sonunda `index.html`, `404.html` olarak kopyalanır; derin bağlantılar (`/urun/123`) böyle çalışır. `public/.nojekyll` de gerekli, yoksa Jekyll bazı dosyaları eler.

### Katmanlama

Veri erişimini UI bileşenlerine dağıtma. Tek bir veri katmanı kur:

```
src/
  i18n/
    dictionary.ts      // tr + en metinleri, anahtarlar birebir eşleşir
    locale.ts          // etkin dil (biçimlendiriciler buradan okur)
    index.tsx          // I18nProvider + useI18n
  lib/
    supabase.ts        // client (anon key)
    image.ts           // canvas ile yeniden boyutlandırma
    format.ts          // tarih, para, "42 gün kaldı" metinleri
  api/
    receipts.ts        // upload, liste, durum sorgulama, n8n bildirimi
    products.ts        // CRUD, onaylama, arama
  hooks/
    useAuth.ts
    useProducts.ts     // TanStack Query sarmalayıcıları
    useReceiptStatus.ts
  features/
    auth/
    upload/
    review/            // OCR onay ekranı
    dashboard/
    search/
  components/ui/       // buton, kart, alan, rozet — paylaşılan ilkel bileşenler
  App.tsx
```

**Kural:** Supabase çağrısı yalnızca `src/api/` altında bulunur. Bileşenler hook'ları çağırır, hook'lar `api/`'yi çağırır. Bu ayrım korunmalı — ileride bir uç noktayı Edge Function'a taşımak gerekirse tek dosya değişir.

**Tip güvenliği:** Şemadan tip üret (`supabase gen types typescript`), elle tip yazma. `v_products` satır tipi tüm liste ekranlarının ortak tipidir.

**Durum takibi:** Supabase Realtime yerine **koşullu polling** kullan — sadece ekranda `pending` veya `processing` durumunda kayıt varken 4 saniyede bir sorgula, hepsi çözülünce durdur. Realtime'ın RLS yapılandırması bu ölçekte gereksiz karmaşıklık.

---

## 8. Ekranlar

### Giriş
E-posta + şifre. Kayıt ekranı yok. Şifre sıfırlama bağlantısı olsun. Oturum `supabase.auth` ile kalıcı.

### Ana sayfa
Üç bölüm, bu öncelik sırasıyla:

1. **Onay bekleyenler** — `receipt_status='parsed'` ve `is_confirmed=false` olan ürünler. Bir tane bile varsa en üstte ve dikkat çekici olmalı; sistemin doğru çalışması buna bağlı. Hiç yoksa bölüm görünmez.
2. **Süresi yaklaşanlar** — `days_left ≤ 90`, artan sırada. `critical` ve `warning` görsel olarak ayrışmalı.
3. **Tüm ürünler** — özet liste, filtrelenebilir.

Ayrıca kalıcı bir yükleme aksiyonu (mobilde alt köşede sabit).

### Yükleme
Tek bir aksiyon, üç kaynak: kamera, galeri, dosya.

```html
<!-- kamera -->
<input type="file" accept="image/*" capture="environment">
<!-- galeri / dosya -->
<input type="file" accept="image/*,application/pdf">
```

Akış: seç → küçült → Storage'a yükle → `receipts` satırı → webhook → ilerleme göstergesi. Kullanıcı beklerken uygulamada gezinebilmeli; işlem arka planda sürsün.

### Onay ekranı (kritik)
OCR sonucunu **düzenlenebilir** göster. Alanlar: ürün adı, marka, satıcı, alım tarihi, garanti süresi (ay), fiyat, seri no, not.

- Fişin görselini yan yana göster (imzalı URL) — kullanıcı okunanı orijinalle karşılaştırabilmeli.
- Garanti süresi için hızlı seçim sun: 24 ay (varsayılan), 12, 36, 60, özel.
- Bir fişten birden fazla ürün çıkmışsa hepsi tek ekranda düzenlenebilmeli; ürün eklenip silinebilmeli.
- Onayla → `products.is_confirmed = true`, `receipts.status = 'confirmed'`.

Bu ekran atlanabilir olmamalı, ama onay tek dokunuşla mümkün olmalı — model çoğu zaman doğru okuyacak.

### Arama
`search_products` RPC'sine bağlı tek bir alan, yazdıkça sonuç (debounce ~300 ms). Sonuçta kalan süre net görünsün. Boş sonuç ekranı yönlendirici olsun.

### Ürün detayı
Tüm alanlar, fiş görseli, kalan süre, düzenle ve sil. Elle ürün ekleme de bu formu kullanabilir (fişsiz, `receipt_id` NULL).

---

## 9. Tasarım yönü

**Konu:** zamanı tükenen nesneler. Arayüzün asıl bilgisi "ne kadar kaldı" — tasarım bunu merkeze almalı.

**İmza öğesi:** her ürün kartında ince bir **süre şeridi** — satın alma tarihinden garanti bitişine kadar olan aralığı gösteren, geçen kısmı dolmuş bir çubuk. Kalan süre azaldıkça rengi değişir. Sayı okumadan durumu anlatan tek öğe bu olsun; gözü çeken tek şey de bu olsun, gerisi sakin kalsın.

**Yazı:** Rakamlar ve tarihler için monospace bir yüz kullan — fiş/kasa dünyasının doğal karakteri budur ve hizalı sayılar taranmayı kolaylaştırır. Başlık ve gövde için ayrı, karakterli bir grotesk seç. Üç rol: başlık / gövde / veri.

> Google Fonts kullanıyorsan **`latin-ext` alt kümesini dahil et**, aksi halde ş, ğ, ı, İ karakterleri düşer. Bu pazarlık konusu değil.

**Renk:** Durum renkleri (normal / yaklaşıyor / kritik / dolmuş) paletin omurgasıdır; süslemeyle karıştırma. Kırmızıyı yalnızca gerçekten kritik olan için sakla — her şey acilse hiçbir şey acil değildir.

**Kaçınılacaklar:** krem zemin + serif başlık + terracotta vurgu üçlüsü, siyah zemin + tek neon vurgu, gereksiz gradyan. Bunlar seçim değil, varsayılan.

**Kalite tabanı:** mobil öncelikli (ana kullanım telefondan olacak), klavye odağı görünür, `prefers-reduced-motion` desteklenir, dokunma hedefleri ≥44 px.

**Metin dili:** Varsayılan Türkçe, İngilizce seçeneği var (üst çubuktaki TR/EN anahtarı, tercih `localStorage`'da). Sistem terimleriyle değil, kullanıcının diliyle konuş — "OCR işlemi başarısız" değil, "Fiş okunamadı, bilgileri elle girebilirsin". Boş ekranlar davet edici olsun, hatalar ne yapılacağını söylesin. Bu ton her iki dilde de korunmalı.

> Arayüzde sabit metin bırakma. Tüm metinler `src/i18n/dictionary.ts` içinde; İngilizce sözlük Türkçe sözlükle birebir aynı anahtarları taşımak zorunda, tip kontrolü bunu zorluyor. Hata döndüren saf fonksiyonlar (`validateDraft`, `validateFile`, auth hataları) metin değil **sözlük anahtarı** döndürür; çeviriyi gösteren bileşen yapar.
>
> Tarih, para ve "42 gün kaldı" biçimlendiricileri `lib/format.ts` içinde ve etkin dili `i18n/locale.ts`'ten okurlar — bileşenlerden dil parametresi geçirilmez.

---

## 10. Ortam değişkenleri

`.env.local` (repoya girmez, `.gitignore`'da olmalı):

```
VITE_SUPABASE_URL=https://ycvzelwoouxkxljmkzcy.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

n8n bilgileri istemciye girmez. Supabase panelinde **Edge Functions · Secrets** altında tutulurlar ve yalnızca `notify-receipt` fonksiyonu okur:

```
N8N_WEBHOOK_URL=https://n8n.srv1508998.hstgr.cloud/webhook/receipt-uploaded
N8N_WEBHOOK_SECRET=<n8n onlyRunIf ifadesindeki değer>
```

`VITE_` önekli her değişken derlenmiş pakette görünür. Anon key için bu tasarım gereğidir. Webhook secret'ı da görünür olacaktır; bu kabul edilen bir risktir çünkü en kötü senaryoda birileri n8n'i boşuna tetikler — veriye erişemez. Buraya başka hiçbir sır koyma.

Aynı dört değişken GitHub deposunda **Settings · Secrets and variables · Actions** altında da tanımlanmalıdır; derleme GitHub Actions'ta çalıştığı için `.env.local` oraya gitmez. `VITE_BASE_PATH` tanımlamaya gerek yok, workflow onu depo adından türetir.

---

## 11. Kabul kriterleri

- [ ] Giriş yapılabiliyor, oturum sayfa yenilendikten sonra korunuyor
- [ ] iPhone'da fotoğraf çekip yükleme çalışıyor; dosya 1600 px'e küçülüyor
- [ ] Yükleme sonrası kayıt `pending` görünüyor, işlem bitince kendiliğinden `parsed`'a dönüyor
- [ ] Onay ekranında OCR çıktısı düzeltilebiliyor; onaylanınca ürün listeye giriyor
- [ ] Ana sayfada süresi yaklaşan ürünler doğru sırada ve doğru renkte
- [ ] Türkçe karakterli arama çalışıyor (`sofben` → `şofben` bulur)
- [ ] Uygulama iPhone ana ekranına eklenip tam ekran açılıyor
- [ ] Başka bir kullanıcının verisi hiçbir şekilde görünmüyor (RLS doğrulaması)

---

## 12. Kapsam dışı

Bunları yapma, istenmedi: çoklu kullanıcı yönetimi, ekip/paylaşım özellikleri, ödeme, ürün kategorisi otomatik sınıflandırma, garanti belgesi oluşturma, push bildirimi (hatırlatma e-posta ile gidiyor), tema değiştirici.

> Not: "çoklu dil" başlangıçta bu listedeydi; sonradan Türkçe/İngilizce seçeneği istendi ve eklendi (§9). Hatırlatma e-postaları hâlâ yalnızca Türkçe — n8n'deki `Maili Hazirla` node'u dil bilmiyor.

---

## 13. Backend'de bekleyen kurulum

Bunlar kod işi değildir, kullanıcının panellerden yapması gerekir. Frontend geliştirilebilir ancak uçtan uca test bunlar tamamlanmadan mümkün değildir:

1. **n8n credential'ları** — dört tane oluşturulup her HTTP Request node'una elle atanacak:
   - `Supabase Service Role` (Host + service_role key)
   - `Google Gemini` (AI Studio API anahtarı)
   - `Garanti Webhook Secret` (Header Auth: `x-garanti-secret`)
   - `Gmail` (OAuth)
2. **Supabase Auth** — Sign Ups kapatılacak, kullanıcı elle oluşturulacak
3. **İlk gerçek fiş testi** — n8n'in binary depolama modu `filesystem` ise Gemini'ye giden `$binary.data.data` ifadesi boş dönebilir; o durumda akışa bir Extract from File adımı eklenmesi gerekir

Workflow'lar:
- Fiş İşleme (OCR): `https://n8n.srv1508998.hstgr.cloud/workflow/SC0KRFoV74qCISpl`
- Hatırlatma Maili: `https://n8n.srv1508998.hstgr.cloud/workflow/4CkufKdxwQOQlJNz`

---

## 14. Çalışma notları

- Şemayı değiştirmen gerekirse migration yaz, panelden elle değiştirme; n8n workflow'ları bu şemaya bağlıdır.
- `v_products`, `search_products` ve `get_due_reminders` üçü de mevcut kolon adlarına bağlıdır. Kolon adı değiştirirsen bu üçünü ve n8n'deki Code node'larını da güncelle.
- `get_due_reminders()` yalnızca `service_role` tarafından çağrılabilir. Frontend'den çağırmaya çalışma, yetki hatası alırsın — bu kasıtlıdır.
