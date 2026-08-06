# Handoff: Garanti Takip — iOS Liquid Glass arayüz yenilemesi (yön 1b, "Sağlık Panosu")

## Overview

`slymncskn/garanti-takip` (Vite + React + TS + Tailwind v4 + Supabase PWA) uygulaması iPhone'da ana ekrana eklenip bir uygulama gibi kullanılıyor. Sorun: arayüz bir web sayfası gibi duruyor. Bu handoff, uygulamanın tüm ekranlarını **iOS 26 "Liquid Glass"** diline taşıyan onaylanmış tasarım yönünü (turda `2a` / `1b` — "Sağlık Panosu", Apple Health + Ayarlar mantığı) tarif eder.

Kapsam: mevcut bilgi mimarisi ve veri modeli **değişmiyor**. Değişen şey kabuk (navigasyon), tipografi, yüzey dili ve form sunumu.

Hedef davranış (tek satırla): `AppShell`'in sticky header + sağ altta yüzen `+` düğmesi ikilisi kaldırılır; yerine **yüzen cam alt sekme çubuğu** (Özet · Ara · Ekle) gelir, dil ve çıkış yeni bir **Hesap** ekranına taşınır, tüm kartlar/formlar iOS'un "gruplanmış inset liste" yüzeyine dönüşür.

## About the Design Files

Bu pakette bulunan `Liquid Glass Redesign.dc.html` bir **tasarım referansıdır** — HTML ile üretilmiş, hedeflenen görünüm ve davranışı gösteren bir prototip. Üretim kodu değildir, kopyalanıp yapıştırılmaz.

Görev: bu tasarımları **hedef kod tabanının mevcut ortamında yeniden kurmak** — yani `slymncskn/garanti-takip` içinde React + TypeScript + Tailwind v4 ile, repoda kurulu desenlere uyarak:

- Supabase çağrısı yalnızca `src/api/` altında; bileşenler hook'ları, hook'lar `api/`'yi çağırır (repo kuralı, `README.md`).
- Renk/tipografi token'ları `src/index.css` içindeki `@theme` bloğunda tanımlanır; bileşenlerde Tailwind sınıfı olarak kullanılır (`bg-surface`, `text-ink-faint`, `rounded-card`…).
- Tüm metinler `src/i18n/dictionary.ts` üzerinden geçer (`t('...')`); TR ve EN aynı anda güncellenir. Prototipteki Türkçe metinler doğrudan yazılmamalı, sözlüğe eklenmeli.
- Dokunma hedefleri en az 44 px (`min-h-11`), input font-size 16 px (iOS zoom'u engellemek için) — mevcut kurallar korunur.

Prototipteki ölçüler 392 × 812 px'lik bir iPhone ekranı içindir (iPhone 14/15/16 mantıksal genişliği 393 pt).

## Fidelity

**High-fidelity.** Renkler, tipografi, boşluklar, yarıçaplar ve blur değerleri nihaidir; prototipteki değerler birebir uygulanmalı. Yalnızca ikon setleri düşük fidelity: prototipte basit stroke SVG'ler var, bunlar hedef kodda **SF Symbols benzeri bir ikon seti** ya da mevcut inline SVG'lerle değiştirilebilir (aşağıda "Assets").

---

## Design Tokens

### Yüzey / mürekkep (mevcut `@theme` üzerine eklemeler)

| Token | Değer | Not |
|---|---|---|
| `--color-paper` | `#f4f3f0` | Mevcut `#f7f7f5` bir tık koyulaştı — camın kontrast kazanması için |
| `--color-surface` | `#ffffff` | değişmedi |
| `--color-sunken` | `#f0efeb` | değişmedi |
| `--color-line` | `#e3e2dc` | değişmedi (yalnızca cam olmayan yüzeylerde) |
| `--color-ink` | `#1c1c1a` | değişmedi |
| `--color-ink-soft` | `#55554e` | değişmedi |
| `--color-ink-faint` | `#8a8a80` | değişmedi |
| `--color-ink-hint` | `#c7c6be` | YENİ — placeholder ve chevron rengi |
| `--color-accent` | `#24413f` | değişmedi |
| `--color-accent-hi` | `#2e514e` | YENİ — aksiyon gradyanının üst durağı |

### Durum renkleri — iOS paleti (seçilen varyant)

Kodda hâlihazırda "durum omurgası" var; iOS sistem renklerine yaklaştırılmış hâli seçildi:

| Durum | `text/bar` | `soft/rail` | Eski değer (yedek) |
|---|---|---|---|
| `active` | `#248a3d` | `#e3f4e7` | `#1f7a5a` / `#e4f1ea` |
| `soon` | `#b25000` | `#fdeee0` | `#a2761b` / `#f8efdc` |
| `warning` | `#c93400` | `#fdeae4` | `#c2570c` / `#fbebdf` |
| `critical` | `#d70015` | `#fde8ea` | `#c01c28` / `#fbe6e7` |
| `expired` | `#8e8e93` | `#ececee` | `#8a8a80` / `#ececeb` |

`src/lib/status.ts` yapısı korunur, yalnızca `@theme` içindeki hex'ler güncellenir. Kural aynı kalır: kırmızı yalnızca `critical` içindir.

### Cam yüzey (Liquid Glass) — üç seviye

Prototipte "cam yoğunluğu" 5/10 seçildi; bu seviyenin ürettiği değerler:

```css
/* 1) Yüzey camı — kartlar, gruplanmış listeler */
background: rgba(255, 255, 255, 0.64);
backdrop-filter: blur(17px) saturate(190%);
-webkit-backdrop-filter: blur(17px) saturate(190%);
border: 0.5px solid rgba(255, 255, 255, 0.9);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 12px 28px rgba(28,28,26,0.07);

/* 2) Kabuk camı — alt sekme çubuğu, üst bar, sheet */
background: rgba(255, 255, 255, 0.60);      /* üst bar: rgba(244,243,240,0.72) */
backdrop-filter: blur(25px) saturate(200%);
border: 0.5px solid rgba(255, 255, 255, 0.9);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.95),
            inset 0 -1px 0 rgba(28,28,26,0.04),
            0 10px 30px rgba(28,28,26,0.13);

/* 3) Hafif cam — çipler, küçük kontroller */
background: rgba(255, 255, 255, 0.70);
backdrop-filter: blur(12px);
border: 0.5px solid rgba(255, 255, 255, 0.85);
```

Kritik: `backdrop-filter` ancak arkasında **kıracak bir şey** varsa görünür. Bu yüzden `body` üzerine renk yıkaması gerekir (aşağıda), aksi halde cam düz beyaz görünür ve tüm etki kaybolur.

### Arka plan yıkaması (camın hammaddesi)

Her ekranın kökünde, içeriğin altında sabit bir katman:

```css
background:
  radial-gradient(560px 340px at 88% -4%, rgba(215,0,21,0.14), transparent 68%),
  radial-gradient(520px 320px at 6% 12%, rgba(36,138,61,0.13), transparent 70%);
```

Seçilen ton kırmızıya çalan varyanttır (`rgba(192,28,40,.14)` ≈ yukarıdaki ilk durak). Ekran bazında ton değişir: detay ekranında ürünün **durum rengi** yıkamayı sürükler (yaklaşan ürün → amber yıkama). Yıkama `position: fixed; inset: 0; z-index: -1` mantığında, scroll ile hareket etmez.

### Tipografi

Space Grotesk / Inter / JetBrains Mono **kaldırılır** — native hissin en büyük payı burada. `index.html` içindeki Google Fonts `<link>` ve `preconnect` satırları silinir (aynı zamanda ilk boyamayı hızlandırır).

```css
--font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
--font-sans:    -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
--font-mono:    ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace;
```

Ölçek (px / weight / line-height / letter-spacing):

| Rol | Değer |
|---|---|
| Büyük başlık (ekran adı) | 32 / 700 / 1.1 / -0.03em |
| Ekran alt başlığı (bölüm adı, ALL CAPS) | 13 / 600 / 1 / 0.02em, `color: ink-faint` |
| Sayfa başlığı (detay ürün adı) | 26–27 / 700 / 1.15 / -0.03em |
| Liste satırı başlığı | 15.5 / 500 / 1.25 / -0.015em |
| Liste satırı alt metni | 12.5 / 400 / 1.3, `ink-faint` |
| Gövde | 15–15.5 / 400 / 1.5 |
| Nav bar başlığı | 16 / 600 / 1 / -0.01em |
| Nav bar aksiyonu | 17 / 400, `accent` |
| Sekme etiketi | 10.5 / 500–600 |
| Dev geri sayım | 68 / 600 / 1 / -0.05em, **mono, tabular-nums** |
| Satır sonu sayı | 17 / 600, **mono, tabular-nums** |

Kural: **her sayı mono + `font-variant-numeric: tabular-nums`** (mevcut `.tabular` utility'si korunur, yalnızca font-family değişir).

### Yarıçap ve boşluk

| Token | Değer | Kullanım |
|---|---|---|
| `--radius-card` | `1.375rem` (22px) | gruplanmış liste / kart (mevcut 14px'ten büyüdü) |
| `--radius-control` | `1.125rem` (18px) | büyük düğmeler |
| `--radius-field` | `0.8125rem` (13px) | çip, segment, küçük düğme |
| tabbar | `33px` (yükseklik 66, tam yuvarlak uçlar) | |
| sheet | `26px` | |
| avatar / ikon karesi | `11px` (34px kutu), `17–20px` (52–64px kutu) | |

Yatay ekran kenarı boşluğu **20 px** (mevcut 16'dan büyüdü). Bölümler arası 22 px. Liste satırı iç boşluğu `13–15px 16px`.

### Gölge

```
kart:      0 12px 28px rgba(28,28,26,.07)
liste:     0 10px 24px rgba(28,28,26,.06)
tabbar:    0 10px 30px rgba(28,28,26,.13)
sheet:     0 18px 40px rgba(28,28,26,.18)
aksiyon:   inset 0 1px 0 rgba(255,255,255,.25), 0 10px 24px rgba(36,65,63,.30)
```

Aksiyon düğmesi dolgusu her yerde `linear-gradient(180deg,#2e514e,#24413f)` + yukarıdaki inset — düz renk değil.

---

## Screens / Views

Ekranların tamamı pakete dahil HTML dosyasında görülebilir (turda `2a` ve `1b`). Aşağıda her biri sırayla.

### 1. Kabuk — `AppShell`

**Amaç:** navigasyonun native karşılığı.

**Kaldırılanlar:** `sticky top-0` header (logo + credit + dil + ara + çıkış) ve `UploadButton`'ın sağ alt köşedeki 56 px FAB'ı.

**Gelenler:**

- **Yüzen cam sekme çubuğu.** `position: fixed; left/right: 12px; bottom: calc(env(safe-area-inset-bottom) + 14px); height: 66px; border-radius: 33px`, kabuk camı (2. seviye). İçinde `justify-content: space-around`, üç öğe:
  1. **Özet** — ikon: 20 × 20 halka (`border: 2.2px solid currentColor; border-radius: 50%`), etiket 10.5/600. Aktif `#24413f`, pasif `#8a8a80`.
  2. **Ara** — mevcut `AppShell` içindeki büyüteç SVG'si (`circle cx=11 cy=11 r=7` + `m20 20-3.5-3.5`), 21 px, `stroke-width` aktifken 2.2 pasifken 1.9.
  3. **Ekle** — 50 × 50, `border-radius: 25px`, aksiyon gradyanı + `0 6px 16px rgba(36,65,63,.4)`, içinde beyaz artı (mevcut `PlusIcon`), 23 px. Bu bir sekme değil, **sheet açar**.
- Hesap ekranına giriş: Özet ekranının sağ üstündeki 38 px avatar dairesi (baş harfler, hafif cam).
- Sekme çubuğu içerik üstünde durur ve altındaki satırların bulanık geçişi **istenen davranıştır**; `main` alt boşluğu `padding-bottom: 104px`.
- Onay (`/onay/:receiptId`) ve form (`/yeni`, `/duzenle`) ekranlarında sekme çubuğu görünmez — mevcut `showUpload` regex mantığı bu iki ekran için `showTabBar` olarak korunur; yerine ekranın kendi alt aksiyon çubuğu gelir.

### 2. Özet (`DashboardPage`)

**Amaç:** "ne kadar kaldı" sorusunun tek bakışta cevabı.

**Yerleşim** (yukarıdan aşağı, 20 px yan boşluk):

1. **Başlık bloğu** — `ÖZET` (13/600, ink-faint, letter-spacing .02em) + `Bugün` (32/700/-0.03em). Sağda 38 px avatar (hafif cam, baş harfler 13/600, `accent`).
2. **Özet kartı** (yüzey camı, radius 24, padding 20, `display:flex; gap:20; align-items:center`):
   - **Segmentli halka**, 104 × 104. SVG `viewBox="0 0 120 120"`, `transform: rotate(-90deg)`, `cx=cy=60 r=52 stroke-width=13`. Zemin çemberi `rgba(28,28,26,.07)`. Üstünde durum başına bir yay: `stroke-dasharray="<pay> 327"` + `stroke-dashoffset` ile diziliş (`327 ≈ 2πr`), `stroke-linecap: round`. Sıra: active → soon → warning/critical. Ortada toplam ürün sayısı (30/600 mono) + `ÜRÜN` (10/500, letter-spacing .04em).
   - **Kırılım listesi**: her satır 8 px renk noktası + sayı (14/600 mono) + etiket (13/400, ink-soft) — `sürüyor`, `yaklaşıyor`, `kritik / az kaldı`, `doldu`. Veri `splitProducts` + `warranty_status` sayımından gelir.
3. **`DİKKAT GEREKTİRENLER`** bölümü — `days_left <= 90`, artan sıralı (mevcut `expiringSoon`). Gruplanmış cam liste (radius 22, `overflow: hidden`), satırlar arası `0.5px solid rgba(28,28,26,.07)`. Satır: 34 px renkli baş-harf karesi (`background: <status soft>`, `color: <status text>`, radius 11, 14/700) → ad (15.5/500) + `bitiş tarihi · marka · satıcı` (12.5/400) → sağda sayı (17/600 mono, durum rengi) üstünde `GÜN` (10/500, ink-faint) → 14 px chevron (`ink-hint`).
4. **`ONAY BEKLİYOR`** bölümü — `receipt_status === 'parsed' && !is_confirmed`, fiş bazında gruplu (mevcut `groupByReceipt`). Kart camı ama amber tonlu: `background: rgba(<soon-soft>,.62); border: .5px solid rgba(<soon>,.28); box-shadow: 0 12px 28px rgba(<soon>,.10)`. İçerik: satıcı baş harfi karesi + satıcı adı + `Fişten {n} ürün okundu`, altında madde işaretli (4 px daire) ürün adları, en altta tam genişlik `Kontrol et ve onayla` aksiyon düğmesi (48 px, radius 15).
5. **`İŞLENİYOR`** bölümü (`PendingReceipts` + `UploadStatus` birleşti) — tek gruplanmış cam liste, iki satır tipi:
   - Yükleme: 34 px kare içinde dönen 16 px halka (`border: 2.4px solid rgba(28,28,26,.18); border-top-color: #55554e`), dosya adı, `Yükleniyor… %68`, altında 4 px ilerleme çubuğu (`accent`).
   - Okunuyor: aynı yapı, amber halka, `Fiş okunuyor` + `{tarih} · birkaç dakika sürebilir`.
   - Hata: `critical-soft` camı, 8 px kırmızı nokta + başlık + açıklama + `Tekrar dene` / `Elle ekle` düğme çifti (42 px, radius 13).
6. **`TÜM ÜRÜNLER`** bölümü — filtre çipleri (`Hepsi / Sürüyor / Yaklaşan / Dolmuş`, `min-height: 44px`, radius 999, seçili `bg-ink text-paper`, seçilmemiş hafif cam) + gruplanmış cam liste. Satır: renkli baş-harf karesi → ad (15.5/500) + **120 px genişlik, 4 px yüksek `TimeBar`** → sağda kısa süre (14/600 mono, durum rengi). `TimeBar` bileşeni korunur, yalnızca `h-1.5` → `h-1` ve genişlik sınırı eklenir.

**Boş durum:** kesikli (`stroke-dasharray="4 9"`) gri halka + ortada `0`, altında `Henüz ürün yok` (24/700), açıklama (15/400, max 280 px), `Fiş ekle` aksiyon düğmesi (52 px, radius 18, ikon + metin) ve altında metin düğmesi `Fişsiz elle ekle`. Mevcut `EmptyState` bileşeninin kesikli kenarlı kartı **kaldırılır** — boş durum artık kart değil, ekran ortası.

### 3. Ürün detayı (`ProductDetailPage`)

1. **Nav bar** — üst 48 px, kabuk camı, solda chevron + `Özet` (17/400, accent). Scroll'da alt kenara `0.5px` çizgi gelir.
2. **Kimlik bloğu** — ortalanmış: 56 px durum renkli baş-harf karesi (radius 18) → ad (26/700/-0.03em) → `marka · satıcı` (14/400, ink-faint).
3. **Geri sayım kartı** (yüzey camı, radius 26, padding 22, ortalı):
   - `GARANTİ BİTİMİNE` (12/600, durum rengi, letter-spacing .06em)
   - Dev sayı: `68/600 mono, tabular-nums, -0.05em` + yanında birim (`gün`, 20/500, ink-faint). Metin `remainingText()`'ten türetilir; 45 günden uzun sürelerde birim `ay`/`yıl` olur.
   - 10 px yüksek şerit, `border-radius: 999px`, zemin `rgba(28,28,26,.07)`, dolgu `linear-gradient(90deg, <active>, <mevcut durum rengi>)` — geçilen sürenin renk yolculuğu. Oran `elapsedRatio()`.
   - Altında iki tarih (11.5/500 mono): sol `ink-faint`, sağ durum rengi.
4. **İki kutucuk** (`grid-cols-2`, gap 10, radius 20, yüzey camı, padding 14): `GARANTİ` → `2 yıl` (20/600), `FİYAT` → `₺64.999` (20/600 mono). Etiketler 11.5/500, letter-spacing .03em.
5. **Gruplanmış liste** — `Seri no` (mono), `Fiş → Görüntüle` (aksiyon rengi, satır tıklanabilir → `ReceiptViewer`). Not varsa altına ayrı bir cam kart.
6. **Alt aksiyon** — tam genişlik `Hatırlatıcı kur` (52 px, radius 18, aksiyon gradyanı). `Düzenle` nav bar'ın sağına taşınır (17/400, accent). **Sil** artık bir düğme değil: listenin en altında `Ürünü sil` satırı (`critical` rengi) → iOS action sheet ile onay. Mevcut inline onay kartı kaldırılır.

### 4. Ara (`SearchPage`)

1. Büyük başlık `Ara` (32/700).
2. **Arama alanı** — 44 px, radius 15, yüzey camı, solda 17 px büyüteç (`ink-faint`), metin 17/400. `border` yerine cam kenar; focus'ta `border-color: accent`.
3. Sonuç sayısı `1 SONUÇ` (12.5/500 mono, ink-faint, ALL CAPS).
4. Sonuçlar Özet'teki **aynı gruplanmış liste satırı** ile (baş harf + ad + gün sayısı). `ProductCard` yerine paylaşılan `ProductRow` bileşeni çıkarılması önerilir.
5. Boş/başlangıç durumu: `SON ARAMALAR` başlığı + hafif cam çipler (8 px 13 px, radius 999). Bu yeni bir özellik — `localStorage`'da son 3–5 terim (`garanti:recent-searches`); istenmiyorsa mevcut `EmptyState` metinleri ekran ortasında gösterilir.

### 5. Fiş ekle — alt sheet (`UploadButton`)

FAB + açılır menü yerine **iOS action sheet**:

- Arka plan: içerik `filter: blur(2px); opacity: .5`, üstüne `rgba(28,28,26,.20)` katman. Dokununca kapanır (mevcut davranış korunur).
- Sheet: `left/right: 10px; bottom: 14px`, radius 26, kabuk camı, `box-shadow: 0 18px 40px rgba(28,28,26,.18)`.
- Başlık bloğu: `Fiş ekle` (15/600, ortalı) + `Fişi oku, ürünleri kendisi çıkarsın` (12.5/400, ink-faint).
- Dört satır (her biri `min-height: 52px`, `0.5px` ayırıcı): 30 px renkli ikon karesi (radius 9) + etiket (17/400) + chevron.
  1. `Fotoğraf çek` — `active-soft` kare → `capture="environment"` input
  2. `Galeriden seç` — `accent-soft` kare → `multiple` image input
  3. `Dosya seç (PDF)` — `sunken` kare → `image/*,application/pdf`
  4. `Elle ekle` + alt metin `Fiş yoksa` — `soon-soft` kare → `/yeni`
- Ayrı bir `İptal` bloğu: 56 px, radius 22, `rgba(255,255,255,.92)` cam, 17/600.
- Giriş animasyonu: `translateY(100%) → 0`, 320 ms `cubic-bezier(.32,.72,0,1)`; arka plan opacity 200 ms. Kapanış 240 ms. Aşağı sürükleyerek kapatma (60 px eşik) tercih edilir.

Mevcut üç gizli `<input>` ve `useUploads().addFiles` akışı **aynen** kullanılır.

### 6. Fiş onayı (`ReviewPage`)

1. **Nav bar** (kabuk camı, alt çizgili): sol `İptal` (17/400, accent) — orta `Fişi kontrol et` (16/600) — sağ `2 ÜRÜN` (11/400 mono, ink-faint).
2. **Fiş özeti** — 92 × 118 px fiş küçük resmi (radius 16, `0 8px 18px`) yanında satıcı (17/600), `tarih · toplam` (13/400), amber `2 ÜRÜN OKUNDU` çipi, `Fişi büyüt` metin düğmesi (13.5/500, accent). Görsel `ReceiptViewer`'ın signed URL'inden gelir; yükleme sırasında çizgili placeholder.
3. **Ürün başına gruplanmış cam liste** — üstünde `ÜRÜN 1` (13/600, ink-faint) ve sağda `Kaldır` (13.5/500, ink-faint → basılınca `critical`).
   Alan satırları **etiket solda (96 px sabit genişlik, 14.5/400, ink-faint) / değer sağda (15.5/500, ink; sayı ve tarihler mono)** biçiminde. `Field.tsx`'in dikey etiket + kutu düzeni bu ekranlarda kullanılmaz — yeni bir `ListField` bileşeni gerekir; aktif satırda sağda 2 px `accent` imleç görünür.
   Sıra: `Ürün adı` · `Marka` · `Kategori` · `Alış tarihi` · `Fiyat`.
4. **Garanti süresi** — aynı listenin son bloğu: etiket üstte, altında 4 segment (`12 ay / 24 ay / 36 ay / Diğer`, `flex:1`, padding 11 px 0, radius 12; seçili `bg-ink text-paper` 14/600, diğerleri `rgba(28,28,26,.05)` 14/500). `WarrantyPicker`'ın 12/24/36/60 preset'i 4 sütuna sığması için `12/24/36/Diğer`'e indirildi; `Diğer` sayısal alanı açar (mevcut davranış).
5. **Garanti bitişi önizlemesi** — `active-soft` zemin, radius 13, solda etiket (13/500, active), sağda tarih (14/600 mono, active). Mevcut `computeEnd` mantığı.
6. **Alt aksiyon çubuğu** — `position: sticky/fixed bottom`, kabuk camı + üst `0.5px` çizgi, `padding-bottom: calc(env(safe-area-inset-bottom) + 26px)`. Solda iki satır bilgi: `2 ürün kaydedilecek` (12.5/500) + `Onaylanmadan hatırlatma gönderilmez` (11.5/400). Sağda `Onayla` (50 px, padding 0 26px, radius 17, aksiyon gradyanı).

`review.*` sözlük anahtarları korunur; yeni metinler (`Fişi büyüt`, `{n} ürün kaydedilecek`, `Onaylanmadan hatırlatma gönderilmez`) sözlüğe TR+EN eklenir.

### 7. Ürün formu (`ProductFormPage`)

1. **Nav bar**: `İptal` — `Yeni ürün` / `Ürünü düzenle` (16/600) — `Kaydet` (17/600, accent; `disabled` iken `ink-hint`). Alttaki `Kaydet/İptal` düğme çifti kaldırılır.
2. Açıklama satırı (13/400, ink-faint): `Fişi olmayan ürünü elle ekle. Garanti bitişini alış tarihi ve süreden kendisi hesaplar.` — yalnızca yeni kayıtta.
3. **Üç gruplanmış cam liste** (aralarında 16 px):
   - Kimlik: `Ürün adı` · `Marka` · `Kategori` · `Satıcı` (boşsa placeholder `ink-hint`)
   - Tarih & süre: `Alış tarihi` (mono) · `Fiyat` (mono) · garanti segmentleri + bitiş önizlemesi (yukarıdaki 4–5 ile birebir aynı)
   - Ek: `Seri no` (mono, placeholder `İsteğe bağlı`) · `Notlar` (etiket üstte, altında çok satırlı metin, placeholder `Servis numarası, kutu yeri, aksesuarlar…`)
4. Doğrulama hatası: ilgili satırın altına `13/400 critical` metin + satır zemininde kısa `critical-soft` flash (240 ms). Mevcut `validateDraft` mesajları kullanılır.

### 8. Hesap (yeni ekran — `src/features/account/AccountPage.tsx`, rota `/hesap`)

`AppShell`'den çıkarılan dil ve çıkış buraya taşınır.

1. Büyük başlık `Hesap` (32/700).
2. **Profil kartı** (yüzey camı, radius 22, padding 16): 52 px aksiyon gradyanlı baş-harf karesi (radius 17, 19/600 beyaz) + ad (16.5/600) + e-posta (13/400, ink-faint). Ad/e-posta `useAuth().session.user`'dan.
3. **`HATIRLATMALAR`** — gruplanmış liste, üç iOS switch'i: `6 ay önce`, `1 ay önce`, `1 hafta önce`. Switch: 46 × 28, radius 14, açık `active` dolgu, kapalı `rgba(28,28,26,.12)`, içinde 24 px beyaz daire + `0 1px 3px`. Bu `reminders.threshold` (`6m/3m/1m/1w/expired`) alanına bağlanır; `src/api/` altında yeni bir `reminders.ts` gerekir. **Backend hazır değilse** bu bölüm ilk sürümde atlanabilir.
4. **`UYGULAMA`** — `Dil` satırında TR/EN segmented control (mevcut `LanguageToggle`, radius 999, seçili beyaz + `0 1px 2px`, 12/600 mono) · `Kayıtlı ürün` → sayı (mono) · `Sürüm` → `1.0.0` (mono).
5. `Çıkış yap` — 52 px, radius 18, `rgba(<critical-soft>,.70)` cam + `0.5px solid rgba(<critical>,.22)`, metin 16/600 `critical`.
6. Altta ortalı `Created By Süleyman Coşkun` (11.5/400, ink-faint) — mevcut `Credit` bileşeni.

### 9. Giriş (`LoginPage`)

1. Sağ üstte dil segmented control (hafif cam zeminde).
2. Ortalanmış blok: **uygulama simgesi** = `public/favicon.svg`, 64 × 64, `border-radius: 20px`, `box-shadow: 0 12px 26px rgba(36,65,63,.32)` (yeni bir logo çizilmez, repodaki asset kullanılır) → `GarantiTakip` (30/700/-0.035em) → `Fişlerini sakla, garanti süresi dolmadan haberin olsun.` (15.5/400, ink-soft).
3. **Gruplanmış cam liste içinde iki alan**: `E-posta` ve `Şifre` — etiket solda 78 px, değer sağda; şifre `letter-spacing: .14em` noktalar; aktif satırda 2 px `accent` imleç.
4. `Giriş yap` (54 px, radius 18, aksiyon gradyanı, 17/600) → altında ortalı `Şifremi unuttum` (14.5/500, accent).
5. Alt kenarda `Created By Süleyman Coşkun`.

Hata mesajı: alanların altında `critical-soft` camlı satır (radius 14, 14/400 critical) — mevcut `role="alert"` korunur. Şifre sıfırlama modu ve "link gönderildi" ekranı aynı cam liste diliyle.

---

## Interactions & Behavior

- **Sekme geçişi** — anlık, animasyonsuz (iOS tab bar davranışı). Aktif sekme rengi `accent`, pasif `ink-faint`.
- **İtme (push) geçişi** — liste satırına basınca detay sağdan girer: yeni ekran `translateX(100% → 0)`, eski ekran `translateX(0 → -22%)` + `opacity .6`, 340 ms `cubic-bezier(.32,.72,0,1)`. Geri hareketi tersi. Kenardan sürükleyerek geri (edge swipe) eklenirse eşik 25 % genişlik.
- **Basma geri bildirimi** — tüm dokunulabilir yüzeyler `:active`'te `transform: scale(.97)` + `filter: brightness(.97)`, 120 ms `ease-out`. Liste satırlarında scale yok, yerine zemin `rgba(28,28,26,.045)`.
- **Sheet** — yukarıda tarif edildi; `Escape` ile kapanma mevcut davranış olarak korunur.
- **Pull-to-refresh** — Özet ekranında 64 px çekmede `useProducts().refetch()`; gösterge 20 px halka, `accent`.
- **Kaydırarak silme** — Tüm ürünler listesinde satırı sola kaydırma iki aksiyon açar: `Hatırlat` (`accent`) ve `Sil` (`critical`, `useDeleteProduct`). Silme öncesi action sheet onayı.
- **Geri sayım şeridi** — `width` geçişi 500 ms `ease-out` (mevcut `TimeBar` davranışı korunur).
- **Halka** — ilk yüklemede `stroke-dasharray` 0'dan hedefe 700 ms `cubic-bezier(.32,.72,0,1)`, kademeli (her yay 80 ms gecikmeli).
- **Yükleme durumu** — mevcut `UploadStatus` toast'ı kaldırılır, Özet'in `İŞLENİYOR` bölümüne taşınır. Diğer ekranlardayken sekme çubuğundaki `Özet` ikonu üzerinde küçük `soon` renkli nokta gösterilir.
- **Haptik** — mümkünse onay ve silmede `navigator.vibrate?.(10)`.
- **`prefers-reduced-motion`** — mevcut `@media` bloğu tüm bu animasyonları kapatır; yeni animasyonlar da bu bloğun kapsamına girmeli.
- **İskelet (skeleton)** — mevcut `Skeleton` korunur ama cam yüzeyle: `rgba(255,255,255,.5)` + `radius 22`.

## State Management

Yeni veri gereksinimi yok. Mevcut hook'lar birebir kullanılır: `useProducts` / `splitProducts` (Özet'in üç bölümü), `useProduct`, `useProductSearch` + `useDebounce`, `useOpenReceipts` / `useRetryReceipt`, `useProductsByReceipt` / `useConfirmReceipt`, `useUploads`, `useAuth`, `useI18n`.

Yeni yerel state:

| Nerede | State | Not |
|---|---|---|
| `AppShell` | `sheetOpen: boolean` | `UploadButton`'dan taşındı |
| `AppShell` | aktif sekme | `useLocation().pathname`'den türetilir, ayrı state gerekmez |
| `SearchPage` | `recent: string[]` | `localStorage` `garanti:recent-searches`, son 5 |
| `ProductDetailPage` | `confirmSheet: boolean` | inline onay kartının yerine action sheet |
| `AccountPage` | `reminders: Record<threshold, boolean>` | backend hazırsa `api/reminders.ts` |

Özet halkasının payları `products` üzerinden `useMemo` ile: durum başına sayı → `dasharray = (count / total) * 327`.

## Assets

- **Uygulama simgesi:** `public/favicon.svg` (repoda var; bu paketin `assets/favicon.svg` kopyası aynı dosya). Giriş ekranında bu kullanılır — yeni logo çizilmemeli. `public/apple-touch-icon.png` ve `public/icons/*` dokunulmaz.
- **İkonlar:** Sekme çubuğu büyüteci ve artı, mevcut `AppShell.tsx` / `UploadButton.tsx` içindeki inline SVG'lerdir — aynen kullanılır. Chevron: `<path d="m9 6 6 6-6 6">`, geri: `<path d="m14 6-6 6 6 6">`, `stroke-width 2.2`, `stroke-linecap: round`. Sheet içindeki dört ikon **placeholder**'dır (basit geometrik şekiller) — SF Symbols karşılıkları (`camera`, `photo.on.rectangle`, `doc`, `plus`) ya da mevcut ikon setiyle değiştirilmeli.
- **Fiş görselleri:** Supabase private `receipts` bucket'ından signed URL ile (`ReceiptViewer`, mevcut). Prototipteki çizgili dokular yalnızca placeholder.
- **Font:** Google Fonts bağımlılığı tamamen kaldırılır; sistem fontları kullanılır (ek asset yok).

## Files

- `Liquid Glass Redesign.dc.html` — tüm ekranların tasarım referansı. Yapı:
  - **Tur 2 (`2a`)** — Giriş · Fiş ekle sheet · Yükleme & okuma durumu · Fiş onayı · Ürün formu · Boş durum · Hesap
  - **Tur 1 (`1b`)** — seçilen yönün Özet · Ürün detayı · Ara ekranları (`1a` ve `1c` reddedilen yönlerdir, referans için duruyor)
  - **Tur 0 (`0a`)** — bugünkü arayüzün koddan birebir kurulmuş hâli (karşılaştırma)
  - Dosyanın üstündeki `glassStrength` / `tint` / `palette` tweak'leri seçilen değerlerde: 5, kırmızıya çalan yıkama, iOS paleti.
- `assets/favicon.svg` — repodaki uygulama simgesinin kopyası.
- `github.md` (proje kökünde) — hangi ekranın hangi kaynak dosyadan türetildiğini gösteren eşleme tablosu.

## Uygulama sırası (öneri)

1. `src/index.css` — `@theme` token'ları (renk, font, radius) + cam yardımcı sınıfları (`.glass-surface`, `.glass-chrome`, `.glass-chip`) ve `body` yıkaması. `index.html`'den Google Fonts satırlarını sil.
2. `AppShell` — sekme çubuğu + sheet + `/hesap` rotası; header'ı kaldır.
3. Paylaşılan parçalar: `ProductRow` (gruplanmış liste satırı), `ListField` / `ListRow`, `SegmentedControl`, `ActionSheet`, `Switch`.
4. `DashboardPage` (halka + üç bölüm) → `ProductDetailPage` → `SearchPage`.
5. `ReviewPage` + `ProductFormPage` (`ProductFields` liste satırlarına dönüşür).
6. `LoginPage`, `AccountPage`.
7. Sözlük: yeni anahtarlar TR + EN.
8. `npm run build` ile tip kontrolü; gerçek iPhone'da ana ekrandan test (cam etkisi ve `env(safe-area-inset-*)` yalnızca gerçek cihazda doğru görünür).
