repo: slymncskn/garanti-takip
branch: main

## Last sync

date: 2026-08-06T22:16:59Z

### Updated in this project

- Mevcut ekranlar (ana sayfa, ürün detayı, arama) koddan birebir yeniden kuruldu
- iOS Liquid Glass yönünde üç tasarım varyasyonu eklendi (1a Sakin Cam, 1b Sağlık Panosu, 1c Skorbord)
- Seçilen 1b yönü tüm ekranlara uygulandı (giriş, fiş ekle, yükleme durumu, fiş onayı, ürün formu, boş durum, hesap)
- Sağ alttaki yüzen + düğmesi yerine cam alt sekme çubuğu önerildi
- Tipografi önerisi: SF / system-ui + tabular mono sayılar

## Screen map

| Proje ekranı | Kaynak dosyalar |
|---|---|
| 0a Mevcut · ana sayfa | src/components/AppShell.tsx, src/features/dashboard/DashboardPage.tsx, src/features/dashboard/PendingReceipts.tsx, src/components/ProductCard.tsx, src/components/TimeBar.tsx, src/components/ui/Card.tsx, src/components/LanguageToggle.tsx, src/features/upload/UploadButton.tsx, src/index.css |
| 0a Mevcut · ürün detayı | src/features/product/ProductDetailPage.tsx, src/components/TimeBar.tsx, src/components/ui/Badge.tsx, src/components/ui/Button.tsx |
| 0a Mevcut · arama | src/features/search/SearchPage.tsx, src/components/ui/EmptyState.tsx |
| 1a / 1b / 1c Liquid Glass | yukarıdakilerin tümü + src/lib/status.ts, src/lib/format.ts, src/i18n/dictionary.ts |
| 2a Giriş | src/features/auth/LoginPage.tsx, src/components/ui/Field.tsx, src/components/LanguageToggle.tsx, src/components/Credit.tsx |
| 2a Fiş ekle · Yükleme durumu | src/features/upload/UploadButton.tsx, src/features/upload/UploadStatus.tsx, src/features/dashboard/PendingReceipts.tsx |
| 2a Fiş onayı | src/features/review/ReviewPage.tsx, src/components/ProductFields.tsx, src/components/WarrantyPicker.tsx, src/components/ReceiptViewer.tsx |
| 2a Ürün formu | src/features/product/ProductFormPage.tsx, src/components/ProductFields.tsx, src/components/WarrantyPicker.tsx, src/lib/draft.ts |
| 2a Boş durum | src/components/ui/EmptyState.tsx, src/features/dashboard/DashboardPage.tsx |
| 2a Hesap | src/components/AppShell.tsx, src/components/LanguageToggle.tsx, src/hooks/useAuth.tsx |
