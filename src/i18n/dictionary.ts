/**
 * Arayüz metinleri. Anahtarlar düz ve noktalı; İngilizce sözlük Türkçe
 * sözlükle birebir aynı anahtarları taşımak zorunda (tip kontrolü zorluyor).
 *
 * Kullanıcının diliyle konuş, sistem terimleriyle değil: "OCR işlemi
 * başarısız" değil, "Fiş okunamadı, bilgileri elle girebilirsin".
 */
export const tr = {
  'app.name': 'GarantiTakip',
  'app.credit': 'Created By Süleyman Coşkun',
  'app.email': 's.coskun@outlook.com',

  'lang.switch': 'Dili değiştir',

  'nav.search': 'Ara',
  'nav.signOut': 'Çıkış yap',

  'login.tagline': 'Fişlerin burada, süreler kontrol altında.',
  'login.resetTagline': 'E-posta adresini yaz, sıfırlama bağlantısını gönderelim.',
  'login.email': 'E-posta',
  'login.password': 'Şifre',
  'login.submit': 'Giriş yap',
  'login.sendLink': 'Bağlantı gönder',
  'login.forgot': 'Şifremi unuttum',
  'login.back': 'Girişe dön',
  'login.sentTitle': 'Bağlantı gönderildi',
  'login.sentBody':
    '{email} adresine bir sıfırlama bağlantısı yolladık. Gelen kutunda göremezsen spam klasörüne bak.',

  'reset.title': 'Yeni şifre belirle',
  'reset.expired':
    'Bu bağlantının süresi dolmuş görünüyor. Giriş ekranından yeni bir sıfırlama bağlantısı isteyebilirsin.',
  'reset.new': 'Yeni şifre',
  'reset.repeat': 'Yeni şifre (tekrar)',
  'reset.submit': 'Şifreyi kaydet',
  'reset.tooShort': 'Şifre en az 6 karakter olmalı.',
  'reset.mismatch': 'İki şifre birbirini tutmuyor.',
  'reset.failed': 'Şifre değiştirilemedi.',

  'auth.badCredentials': 'E-posta ya da şifre hatalı.',
  'auth.notConfirmed': 'Bu e-posta henüz doğrulanmamış.',
  'auth.rateLimited': 'Çok fazla deneme oldu. Birkaç dakika sonra tekrar dene.',
  'auth.weakPassword': 'Şifre en az 6 karakter olmalı.',
  'auth.offline': 'Bağlantı kurulamadı. İnterneti kontrol et.',
  'auth.generic': 'Bir şeyler ters gitti. Tekrar dene.',

  'dash.awaiting': 'Onay bekliyor',
  'dash.expiring': 'Süresi yaklaşanlar',
  'dash.all': 'Tüm ürünler',
  'dash.newReceipt': 'Yeni fiş',
  'dash.awaitingBody':
    '{count} ürün okundu. Bilgileri kontrol edip onaylayana kadar hatırlatma gelmez.',
  'dash.andMore': 've {count} tane daha',
  'dash.review': 'Kontrol et ve onayla',
  'dash.filter.all': 'Hepsi',
  'dash.filter.active': 'Sürüyor',
  'dash.filter.soon': 'Yaklaşan',
  'dash.filter.expired': 'Dolmuş',
  'dash.emptyFilterTitle': 'Bu filtrede ürün yok',
  'dash.emptyFilterBody': 'Başka bir filtre dene ya da yeni bir fiş yükle.',
  'dash.emptyTitle': 'Henüz ürün yok',
  'dash.emptyBody':
    'Sağ alttaki artıya dokunup ilk fişini yükle. Ürünleri okuyup garanti sürelerini takip etmeye başlayalım.',
  'dash.loadError': 'Ürünler getirilemedi. Bağlantını kontrol edip tekrar dene.',
  'dash.retry': 'Tekrar dene',

  'receipt.reading': 'Fiş okunuyor',
  'receipt.readingHint': 'birkaç dakika sürebilir',
  'receipt.failed': 'Fiş okunamadı',
  'receipt.failedGiveUp':
    'Birkaç kez denedik, olmadı. Ürünü elle ekleyebilirsin.',
  'receipt.failedRetry':
    'Tekrar deneyebilir ya da bilgileri elle girebilirsin.',
  'receipt.retry': 'Tekrar dene',
  'receipt.manual': 'Elle ekle',
  'receipt.viewError': 'Fiş görüntülenemedi. Sayfayı yenilemeyi dene.',
  'receipt.pdfFallback': 'PDF burada gösterilemiyor.',
  'receipt.openNewTab': 'Yeni sekmede aç',
  'receipt.zoom': 'Fişi büyüt',
  'receipt.alt': 'Yüklenen fiş',
  'receipt.label': 'Fiş',

  'upload.add': 'Fiş ekle',
  'upload.close': 'Kapat',
  'upload.camera': 'Fotoğraf çek',
  'upload.gallery': 'Galeriden seç',
  'upload.file': 'Dosya seç (PDF)',
  'upload.preparing': 'Küçültülüyor…',
  'upload.uploading': 'Yükleniyor…',
  'upload.done': 'Yüklendi, okunuyor',
  'upload.error': 'Yüklenemedi',
  'upload.failedBody':
    'Yükleme tamamlanamadı. Bağlantını kontrol edip tekrar dene.',
  'upload.tooBig': 'Dosya 10 MB’tan büyük. Daha küçük bir fotoğraf dene.',
  'upload.badType': 'Bu dosya tipini okuyamıyorum. Fotoğraf ya da PDF yükle.',
  'upload.dismiss': 'Kapat',

  'review.title': 'Okunanı kontrol et',
  'review.titleConfirmed': 'Onaylanmış fiş',
  'review.subtitle':
    'Fişin yanında duruyor. Yanlış okunan bir yer varsa düzelt, doğruysa doğrudan onayla.',
  'review.subtitleConfirmed':
    'Bu fiş zaten onaylandı. Ürünleri düzenleyip yeniden kaydedebilirsin.',
  'review.stillReading': 'Fiş hâlâ okunuyor',
  'review.stillReadingBody':
    'Birkaç dakika sürebilir. Hazır olduğunda ana sayfada onay bekleyenler arasında görünecek.',
  'review.backHome': 'Ana sayfaya dön',
  'review.failedBody':
    'Bu fişten bilgi çıkaramadım. Ürünü elle ekleyebilir ya da fişi tekrar yükleyebilirsin.',
  'review.notFound': 'Bu fişi bulamadım. Ana sayfadan tekrar dene.',
  'review.noProducts': 'Bu fişte ürün yok',
  'review.noProductsBody':
    'Fişten ürün çıkaramadım. Aşağıdan elle ekleyebilirsin.',
  'review.product': 'Ürün {n}',
  'review.remove': 'Kaldır',
  'review.addProduct': 'Ürün ekle',
  'review.count': '{count} ürün',
  'review.confirm': 'Onayla',
  'review.needOne': 'En az bir ürün olmalı.',
  'review.saveFailed': 'Kaydedilemedi. Bağlantını kontrol edip tekrar dene.',

  'search.label': 'Ürün ara',
  'search.placeholder': 'Ürün, marka, satıcı ya da seri no',
  'search.results': '{count} sonuç',
  'search.emptyTitle': 'Eşleşen ürün yok',
  'search.emptyBody':
    '“{term}” için sonuç bulamadım. Markayı ya da ürünün kısa adını yazmayı dene.',
  'search.idleTitle': 'Ne arıyorsun?',
  'search.idleBody':
    'Ürün adı, marka, satıcı veya seri numarasıyla arayabilirsin. Türkçe karakterleri yazmasan da bulur.',
  'search.error': 'Arama yapılamadı. Bağlantını kontrol edip tekrar dene.',

  'product.awaiting': 'Onay bekliyor',
  'product.purchaseDate': 'Alım tarihi',
  'product.warranty': 'Garanti',
  'product.warrantyEnd': 'Garanti bitişi',
  'product.price': 'Fiyat',
  'product.category': 'Kategori',
  'product.serial': 'Seri no',
  'product.notes': 'Not',
  'product.edit': 'Düzenle',
  'product.delete': 'Sil',
  'product.deleteAsk': 'Bu ürün silinsin mi?',
  'product.deleteBody': 'Geri alınamaz. Fiş dosyası yerinde kalır.',
  'product.deleteYes': 'Evet, sil',
  'product.cancel': 'Vazgeç',
  'product.notFound': 'Bu ürünü bulamadım. Listeden tekrar seçmeyi dene.',

  'form.newTitle': 'Ürün ekle',
  'form.editTitle': 'Ürünü düzenle',
  'form.newSubtitle': 'Fişi olmayan bir ürünü de takibe alabilirsin.',
  'form.save': 'Kaydet',
  'form.cancel': 'Vazgeç',
  'form.notFound': 'Bu ürünü bulamadım.',
  'form.saveFailed': 'Kaydedilemedi. Bağlantını kontrol edip tekrar dene.',
  'form.nameRequired': 'Ürün adı boş kalamaz.',
  'form.dateRequired': 'Alım tarihi gerekli.',

  'fields.name': 'Ürün adı',
  'fields.namePlaceholder': 'Örn. Çamaşır makinesi',
  'fields.brand': 'Marka',
  'fields.category': 'Kategori',
  'fields.merchant': 'Satıcı',
  'fields.purchaseDate': 'Alım tarihi',
  'fields.price': 'Fiyat',
  'fields.serial': 'Seri numarası',
  'fields.notes': 'Not',
  'fields.notesPlaceholder':
    'Servis telefonu, nerede durduğu, aklında kalsın istediğin her şey',
  'fields.warrantyEndPreview': 'Garanti bitişi:',

  'warranty.label': 'Garanti süresi',
  'warranty.custom': 'Özel',
  'warranty.months': 'ay',
  'warranty.customHint': 'ay (0–240)',
  'warranty.summary': '{label} garanti',
  'warranty.none': 'Garantisiz',
  'warranty.year': '{n} yıl',
  'warranty.monthCount': '{n} ay',

  'status.active': 'Sürüyor',
  'status.soon': 'Yaklaşıyor',
  'status.warning': 'Az kaldı',
  'status.critical': 'Kritik',
  'status.expired': 'Doldu',

  'time.expiredYesterday': 'Dün doldu',
  'time.expiredDays': '{n} gün önce doldu',
  'time.expiredMonths': '{n} ay önce doldu',
  'time.expiredYears': '{n} yıldan uzun süredir dolu',
  'time.today': 'Bugün doluyor',
  'time.tomorrow': 'Yarın doluyor',
  'time.daysLeft': '{n} gün kaldı',
  'time.monthsLeft': '{n} ay kaldı',
  'time.yearsLeft': '{n} yıl kaldı',
  'time.yearsMonthsLeft': '{y} yıl {m} ay kaldı',
  'time.shortExpired': 'doldu',
  'time.shortToday': 'bugün',
  'time.shortDays': '{n} gün',
  'time.shortMonths': '{n} ay',
  'time.shortYears': '{n} yıl+',

  'common.loading': 'Yükleniyor',
  'common.error': 'Bir şeyler ters gitti',

  'config.title': 'Kurulum yarım kalmış',
  'config.body':
    'Supabase bilgileri tanımlı değil. Proje kökündeki .env.example dosyasını .env.local olarak kopyalayıp doldur, sonra sunucuyu yeniden başlat.',
} as const

export type DictKey = keyof typeof tr

export const en: Record<DictKey, string> = {
  'app.name': 'GarantiTakip',
  'app.credit': 'Created By Süleyman Coşkun',
  'app.email': 's.coskun@outlook.com',

  'lang.switch': 'Change language',

  'nav.search': 'Search',
  'nav.signOut': 'Sign out',

  'login.tagline': 'Your receipts, filed. Your warranties, watched.',
  'login.resetTagline':
    'Type your email address and we’ll send you a reset link.',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.sendLink': 'Send link',
  'login.forgot': 'Forgot my password',
  'login.back': 'Back to sign in',
  'login.sentTitle': 'Link sent',
  'login.sentBody':
    'We sent a reset link to {email}. If it isn’t in your inbox, check the spam folder.',

  'reset.title': 'Set a new password',
  'reset.expired':
    'This link looks like it has expired. You can request a new reset link from the sign-in screen.',
  'reset.new': 'New password',
  'reset.repeat': 'New password (again)',
  'reset.submit': 'Save password',
  'reset.tooShort': 'Password must be at least 6 characters.',
  'reset.mismatch': 'The two passwords don’t match.',
  'reset.failed': 'Password could not be changed.',

  'auth.badCredentials': 'Email or password is wrong.',
  'auth.notConfirmed': 'This email hasn’t been confirmed yet.',
  'auth.rateLimited': 'Too many attempts. Try again in a few minutes.',
  'auth.weakPassword': 'Password must be at least 6 characters.',
  'auth.offline': 'Couldn’t connect. Check your internet.',
  'auth.generic': 'Something went wrong. Try again.',

  'dash.awaiting': 'Awaiting confirmation',
  'dash.expiring': 'Expiring soon',
  'dash.all': 'All products',
  'dash.newReceipt': 'New receipt',
  'dash.awaitingBody':
    '{count} products found. No reminders are sent until you check and confirm them.',
  'dash.andMore': 'and {count} more',
  'dash.review': 'Review and confirm',
  'dash.filter.all': 'All',
  'dash.filter.active': 'Active',
  'dash.filter.soon': 'Soon',
  'dash.filter.expired': 'Expired',
  'dash.emptyFilterTitle': 'Nothing in this filter',
  'dash.emptyFilterBody': 'Try another filter, or upload a new receipt.',
  'dash.emptyTitle': 'No products yet',
  'dash.emptyBody':
    'Tap the plus at the bottom right to upload your first receipt. We’ll read it and start tracking the warranties.',
  'dash.loadError': 'Couldn’t load your products. Check your connection and try again.',
  'dash.retry': 'Try again',

  'receipt.reading': 'Reading receipt',
  'receipt.readingHint': 'this can take a few minutes',
  'receipt.failed': 'Couldn’t read the receipt',
  'receipt.failedGiveUp':
    'We tried a few times without luck. You can add the product by hand.',
  'receipt.failedRetry': 'You can try again, or enter the details yourself.',
  'receipt.retry': 'Try again',
  'receipt.manual': 'Add by hand',
  'receipt.viewError': 'Couldn’t display the receipt. Try reloading the page.',
  'receipt.pdfFallback': 'This PDF can’t be shown here.',
  'receipt.openNewTab': 'Open in a new tab',
  'receipt.zoom': 'Enlarge receipt',
  'receipt.alt': 'Uploaded receipt',
  'receipt.label': 'Receipt',

  'upload.add': 'Add receipt',
  'upload.close': 'Close',
  'upload.camera': 'Take a photo',
  'upload.gallery': 'Choose from gallery',
  'upload.file': 'Choose a file (PDF)',
  'upload.preparing': 'Resizing…',
  'upload.uploading': 'Uploading…',
  'upload.done': 'Uploaded, reading',
  'upload.error': 'Upload failed',
  'upload.failedBody':
    'The upload didn’t finish. Check your connection and try again.',
  'upload.tooBig': 'That file is over 10 MB. Try a smaller photo.',
  'upload.badType': 'I can’t read this file type. Upload a photo or a PDF.',
  'upload.dismiss': 'Dismiss',

  'review.title': 'Check what we read',
  'review.titleConfirmed': 'Confirmed receipt',
  'review.subtitle':
    'The receipt is right there. Fix anything misread, or just confirm if it looks right.',
  'review.subtitleConfirmed':
    'This receipt is already confirmed. You can edit the products and save again.',
  'review.stillReading': 'Still reading the receipt',
  'review.stillReadingBody':
    'This can take a few minutes. When it’s ready it will show up under awaiting confirmation on the home screen.',
  'review.backHome': 'Back to home',
  'review.failedBody':
    'I couldn’t pull anything from this receipt. Add the product by hand, or upload the receipt again.',
  'review.notFound': 'I couldn’t find that receipt. Try again from the home screen.',
  'review.noProducts': 'No products on this receipt',
  'review.noProductsBody': 'I couldn’t find products on it. Add them by hand below.',
  'review.product': 'Product {n}',
  'review.remove': 'Remove',
  'review.addProduct': 'Add product',
  'review.count': '{count} products',
  'review.confirm': 'Confirm',
  'review.needOne': 'There has to be at least one product.',
  'review.saveFailed': 'Couldn’t save. Check your connection and try again.',

  'search.label': 'Search products',
  'search.placeholder': 'Product, brand, store or serial number',
  'search.results': '{count} results',
  'search.emptyTitle': 'No matching products',
  'search.emptyBody':
    'Nothing found for “{term}”. Try the brand, or a shorter version of the name.',
  'search.idleTitle': 'What are you looking for?',
  'search.idleBody':
    'Search by product name, brand, store or serial number. Turkish characters are optional.',
  'search.error': 'Search failed. Check your connection and try again.',

  'product.awaiting': 'Awaiting confirmation',
  'product.purchaseDate': 'Purchase date',
  'product.warranty': 'Warranty',
  'product.warrantyEnd': 'Warranty ends',
  'product.price': 'Price',
  'product.category': 'Category',
  'product.serial': 'Serial no',
  'product.notes': 'Notes',
  'product.edit': 'Edit',
  'product.delete': 'Delete',
  'product.deleteAsk': 'Delete this product?',
  'product.deleteBody': 'This can’t be undone. The receipt file stays where it is.',
  'product.deleteYes': 'Yes, delete',
  'product.cancel': 'Cancel',
  'product.notFound': 'I couldn’t find that product. Try picking it from the list again.',

  'form.newTitle': 'Add a product',
  'form.editTitle': 'Edit product',
  'form.newSubtitle': 'You can track a product even without a receipt.',
  'form.save': 'Save',
  'form.cancel': 'Cancel',
  'form.notFound': 'I couldn’t find that product.',
  'form.saveFailed': 'Couldn’t save. Check your connection and try again.',
  'form.nameRequired': 'Product name can’t be empty.',
  'form.dateRequired': 'Purchase date is required.',

  'fields.name': 'Product name',
  'fields.namePlaceholder': 'e.g. Washing machine',
  'fields.brand': 'Brand',
  'fields.category': 'Category',
  'fields.merchant': 'Store',
  'fields.purchaseDate': 'Purchase date',
  'fields.price': 'Price',
  'fields.serial': 'Serial number',
  'fields.notes': 'Notes',
  'fields.notesPlaceholder':
    'Service phone number, where you keep it, anything worth remembering',
  'fields.warrantyEndPreview': 'Warranty ends:',

  'warranty.label': 'Warranty length',
  'warranty.custom': 'Custom',
  'warranty.months': 'months',
  'warranty.customHint': 'months (0–240)',
  'warranty.summary': '{label} warranty',
  'warranty.none': 'No warranty',
  'warranty.year': '{n} years',
  'warranty.monthCount': '{n} months',

  'status.active': 'Active',
  'status.soon': 'Approaching',
  'status.warning': 'Not long left',
  'status.critical': 'Critical',
  'status.expired': 'Expired',

  'time.expiredYesterday': 'Expired yesterday',
  'time.expiredDays': 'Expired {n} days ago',
  'time.expiredMonths': 'Expired {n} months ago',
  'time.expiredYears': 'Expired over {n} years ago',
  'time.today': 'Expires today',
  'time.tomorrow': 'Expires tomorrow',
  'time.daysLeft': '{n} days left',
  'time.monthsLeft': '{n} months left',
  'time.yearsLeft': '{n} years left',
  'time.yearsMonthsLeft': '{y} years {m} months left',
  'time.shortExpired': 'expired',
  'time.shortToday': 'today',
  'time.shortDays': '{n} days',
  'time.shortMonths': '{n} mo',
  'time.shortYears': '{n} yr+',

  'common.loading': 'Loading',
  'common.error': 'Something went wrong',

  'config.title': 'Setup isn’t finished',
  'config.body':
    'Supabase settings are missing. Copy .env.example in the project root to .env.local, fill it in, then restart the server.',
}

export const dictionaries = { tr, en } as const
