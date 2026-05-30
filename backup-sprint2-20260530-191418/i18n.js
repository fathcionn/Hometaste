const TRANSLATIONS = {
  en: {
    nav_home: "Home", nav_browse: "Browse Cooks", nav_orders: "My Orders", nav_messages: "Messages", nav_become_cook: "Become a Cook", nav_help: "Help", nav_settings: "Settings", nav_favorites: "Favorites",
    hero_title: "Find the taste of home", hero_subtitle: "Authentic meals made by home cooks from your country", hero_search_placeholder: "What are you craving today?", hero_cta: "Explore Dishes",
    btn_order_now: "Order Now", btn_add_to_cart: "Add to Cart", btn_checkout: "Checkout", btn_place_order: "Place Order", btn_track_order: "Track Order", btn_become_cook: "Start Cooking", btn_send: "Send", btn_login: "Log In", btn_signup: "Sign Up", btn_save: "Save", btn_cancel: "Cancel", btn_close: "Close", btn_reorder: "Reorder", btn_view_profile: "View Profile",
    cart_title: "Your Cart", cart_empty: "Your cart is empty", cart_subtotal: "Subtotal", cart_delivery: "Delivery Fee", cart_service: "Service Fee", cart_total: "Total", cart_promo: "Promo code",
    checkout_title: "Complete Your Order", checkout_address: "Delivery Address", checkout_payment: "Payment Method", checkout_note: "Note to Cook", checkout_note_placeholder: "Any special requests?",
    track_placed: "Order Placed", track_accepted: "Cook Accepted", track_preparing: "Preparing", track_ready: "Ready for Pickup", track_courier: "Courier Assigned", track_picked: "Picked Up", track_on_way: "On the Way", track_delivered: "Delivered",
    cook_orders: "Orders", cook_rating: "Rating", cook_prep_time: "Prep Time", cook_availability: "Available", cook_verified: "Verified", cook_response_time: "Response Time", cook_repeat_customers: "Repeat Customers", cook_specialties: "Specialties", cook_gallery: "Food Gallery", cook_reviews: "Reviews",
    rating_food: "Food Quality", rating_speed: "Speed", rating_packaging: "Packaging", rating_communication: "Communication",
    dish_ingredients: "Ingredients", dish_spice_level: "Spice Level", dish_prep_time: "Prep Time", dish_sauces: "Available Sauces", dish_drinks: "Available Drinks", dish_verified_photo: "Live Verified Photo", dish_from_gallery: "Photo from Gallery",
    become_title: "Start Cooking on HomeTaste", become_subtitle: "Share your authentic recipes and earn money", form_full_name: "Full Name", form_email: "Email", form_phone: "Phone Number", form_country_origin: "Your Home Country", form_city: "City You Live In", form_bio: "About You", form_bio_placeholder: "Tell customers about yourself and your cooking...", form_dishes: "What dishes do you cook?", form_dishes_placeholder: "e.g. Koshari, Moussaka, Stuffed Vine Leaves...", form_availability: "Availability Hours", form_availability_placeholder: "e.g. Mon-Sat, 12pm-8pm", form_prep_time: "Average Prep Time", form_prep_placeholder: "e.g. 45 minutes", form_photo: "Your Profile Photo", form_submit: "Start Cooking Now",
    photo_camera: "Take Photo (Verified)", photo_gallery: "Upload from Gallery", photo_verified_hint: "Photos taken with your camera get a Verified badge",
    welcome_title: "Welcome to HomeTaste", welcome_subtitle: "First, tell us where you are", welcome_country_prompt: "Which country are you in right now?", welcome_city_prompt: "Which city?", welcome_cuisine_prompt: "What cuisine are you craving today?", welcome_cta: "Find My Food", welcome_skip: "Browse all",
    filter_title: "Filters", filter_cuisine: "Cuisine", filter_price: "Price Range", filter_rating: "Min Rating", filter_prep: "Max Prep Time", filter_available: "Available Now", filter_halal: "Halal Only", filter_vegan: "Vegan", filter_spicy: "Spicy", filter_apply: "Apply Filters", filter_reset: "Reset",
    auth_login_title: "Welcome back", auth_signup_title: "Create your account", auth_email: "Email address", auth_password: "Password", auth_name: "Full name", auth_have_account: "Already have an account?", auth_no_account: "Don't have an account?",
    chat_title: "Messages", chat_placeholder: "Type a message...", chat_quick_1: "Are you available now?", chat_quick_2: "How long will it take?", chat_quick_3: "Can you make it less spicy?", chat_quick_4: "I am at the door", chat_online: "Online", chat_offline: "Offline",
    toast_added_cart: "Added to cart!", toast_removed_cart: "Removed from cart", toast_order_placed: "Order placed successfully!", toast_saved: "Saved successfully", toast_error: "Something went wrong", toast_copied: "Copied!", toast_fav_added: "Added to favorites", toast_fav_removed: "Removed from favorites",
    settings_title: "Settings", settings_language: "Language", settings_notifications: "Notifications", settings_order_updates: "Order Updates", settings_new_dishes: "New Dishes", settings_promotions: "Promotions", settings_currency: "Currency", settings_theme: "Theme",
    help_title: "Help & Support", help_live_chat: "Live Chat", help_email: "Email Us", help_call: "Call Us", help_faq: "Frequently Asked Questions",
    loading: "Loading...", no_results: "No results found", error_generic: "Something went wrong. Please try again.", min: "min", reviews: "reviews", orders_completed: "orders completed"
  },
  ar: {
    nav_home: "الرئيسية", nav_browse: "تصفح الطهاة", nav_orders: "طلباتي", nav_messages: "الرسائل", nav_become_cook: "انضم كطاهٍ", nav_help: "المساعدة", nav_settings: "الإعدادات", nav_favorites: "المفضلة",
    hero_title: "اكتشف طعم البيت", hero_subtitle: "وجبات أصيلة يصنعها طهاة من بلدك", hero_search_placeholder: "ماذا تشتهي اليوم؟", hero_cta: "استعرض الأطباق",
    btn_order_now: "اطلب الآن", btn_add_to_cart: "أضف للسلة", btn_checkout: "إتمام الشراء", btn_place_order: "تأكيد الطلب", btn_track_order: "تتبع الطلب", btn_become_cook: "ابدأ الطهي", btn_send: "إرسال", btn_login: "تسجيل الدخول", btn_signup: "إنشاء حساب", btn_save: "حفظ", btn_cancel: "إلغاء", btn_close: "إغلاق", btn_reorder: "إعادة الطلب", btn_view_profile: "عرض الملف",
    cart_title: "سلة الطلبات", cart_empty: "السلة فارغة", cart_subtotal: "المجموع الفرعي", cart_delivery: "رسوم التوصيل", cart_service: "رسوم الخدمة", cart_total: "الإجمالي", cart_promo: "كود الخصم",
    checkout_title: "إتمام الطلب", checkout_address: "عنوان التوصيل", checkout_payment: "طريقة الدفع", checkout_note: "ملاحظة للطاهي", checkout_note_placeholder: "أي طلبات خاصة؟",
    track_placed: "تم تقديم الطلب", track_accepted: "قبل الطاهي الطلب", track_preparing: "جاري التحضير", track_ready: "جاهز للاستلام", track_courier: "تم تعيين المندوب", track_picked: "تم الاستلام", track_on_way: "في الطريق إليك", track_delivered: "تم التوصيل",
    cook_orders: "الطلبات", cook_rating: "التقييم", cook_prep_time: "وقت التحضير", cook_availability: "متاح", cook_verified: "موثّق", cook_response_time: "وقت الاستجابة", cook_repeat_customers: "العملاء المتكررون", cook_specialties: "التخصصات", cook_gallery: "معرض الأطباق", cook_reviews: "التقييمات",
    rating_food: "جودة الطعام", rating_speed: "السرعة", rating_packaging: "التغليف", rating_communication: "التواصل",
    dish_ingredients: "المكونات", dish_spice_level: "مستوى الحرارة", dish_prep_time: "وقت التحضير", dish_sauces: "الصوصات المتاحة", dish_drinks: "المشروبات المتاحة", dish_verified_photo: "صورة موثّقة مباشرة", dish_from_gallery: "صورة من المعرض",
    become_title: "انضم كطاهٍ في HomeTaste", become_subtitle: "شارك وصفاتك الأصيلة واكسب مالاً", form_full_name: "الاسم الكامل", form_email: "البريد الإلكتروني", form_phone: "رقم الهاتف", form_country_origin: "بلدك الأصلي", form_city: "المدينة التي تعيش فيها", form_bio: "عن نفسك", form_bio_placeholder: "أخبر العملاء عن نفسك وعن طبخك...", form_dishes: "ما الأطباق التي تطهوها؟", form_dishes_placeholder: "مثال: كشري، مسقعة، ورق عنب...", form_availability: "أوقات التواجد", form_availability_placeholder: "مثال: السبت-الخميس، 12 ظهراً-8 مساءً", form_prep_time: "متوسط وقت التحضير", form_prep_placeholder: "مثال: 45 دقيقة", form_photo: "صورة ملفك الشخصي", form_submit: "ابدأ الطهي الآن",
    photo_camera: "التقاط صورة (موثّقة)", photo_gallery: "رفع من المعرض", photo_verified_hint: "الصور الملتقطة من الكاميرا تحصل على شارة التوثيق",
    welcome_title: "أهلاً بك في HomeTaste", welcome_subtitle: "أخبرنا أين أنت الآن", welcome_country_prompt: "في أي دولة أنت حالياً؟", welcome_city_prompt: "في أي مدينة؟", welcome_cuisine_prompt: "ما المطبخ الذي تشتهيه اليوم؟", welcome_cta: "ابحث عن طعامي", welcome_skip: "تصفح الكل",
    filter_title: "تصفية النتائج", filter_cuisine: "نوع المطبخ", filter_price: "نطاق السعر", filter_rating: "أدنى تقييم", filter_prep: "أقصى وقت تحضير", filter_available: "متاح الآن", filter_halal: "حلال فقط", filter_vegan: "نباتي", filter_spicy: "حار", filter_apply: "تطبيق الفلاتر", filter_reset: "إعادة ضبط",
    auth_login_title: "أهلاً بعودتك", auth_signup_title: "إنشاء حساب جديد", auth_email: "البريد الإلكتروني", auth_password: "كلمة المرور", auth_name: "الاسم الكامل", auth_have_account: "لديك حساب بالفعل؟", auth_no_account: "ليس لديك حساب؟",
    chat_title: "الرسائل", chat_placeholder: "اكتب رسالة...", chat_quick_1: "هل أنت متاح الآن؟", chat_quick_2: "كم يستغرق التحضير؟", chat_quick_3: "هل يمكن تقليل الحرارة؟", chat_quick_4: "أنا عند الباب", chat_online: "متصل", chat_offline: "غير متصل",
    toast_added_cart: "تمت الإضافة للسلة!", toast_removed_cart: "تمت الإزالة من السلة", toast_order_placed: "تم تقديم طلبك بنجاح!", toast_saved: "تم الحفظ بنجاح", toast_error: "حدث خطأ ما", toast_copied: "تم النسخ!", toast_fav_added: "أضيف إلى المفضلة", toast_fav_removed: "أُزيل من المفضلة",
    settings_title: "الإعدادات", settings_language: "اللغة", settings_notifications: "الإشعارات", settings_order_updates: "تحديثات الطلب", settings_new_dishes: "أطباق جديدة", settings_promotions: "العروض", settings_currency: "العملة", settings_theme: "المظهر",
    help_title: "المساعدة والدعم", help_live_chat: "دردشة مباشرة", help_email: "راسلنا", help_call: "اتصل بنا", help_faq: "الأسئلة الشائعة",
    loading: "جارٍ التحميل...", no_results: "لا توجد نتائج", error_generic: "حدث خطأ. حاول مجدداً.", min: "دقيقة", reviews: "تقييم", orders_completed: "طلب مكتمل"
  },
  tr: {
    nav_home: "Ana Sayfa", nav_browse: "Aşçıları Keşfet", nav_orders: "Siparişlerim", nav_messages: "Mesajlar", nav_become_cook: "Aşçı Ol", nav_help: "Yardım", nav_settings: "Ayarlar", nav_favorites: "Favoriler",
    hero_title: "Evin tadını bul", hero_subtitle: "Kendi ülkenden ev aşçılarının hazırladığı gerçek yemekler", hero_search_placeholder: "Bugün ne yemek istiyorsun?", hero_cta: "Yemekleri Keşfet",
    btn_order_now: "Sipariş Ver", btn_add_to_cart: "Sepete Ekle", btn_checkout: "Ödemeye Geç", btn_place_order: "Siparişi Onayla", btn_track_order: "Siparişi Takip Et", btn_become_cook: "Aşçı Olmaya Başla", btn_send: "Gönder", btn_login: "Giriş Yap", btn_signup: "Hesap Oluştur", btn_save: "Kaydet", btn_cancel: "İptal", btn_close: "Kapat", btn_reorder: "Tekrar Sipariş Ver", btn_view_profile: "Profili Gör",
    cart_title: "Sepetim", cart_empty: "Sepetiniz boş", cart_subtotal: "Ara Toplam", cart_delivery: "Teslimat Ücreti", cart_service: "Hizmet Ücreti", cart_total: "Toplam", cart_promo: "Promosyon kodu",
    checkout_title: "Siparişi Tamamla", checkout_address: "Teslimat Adresi", checkout_payment: "Ödeme Yöntemi", checkout_note: "Aşçıya Not", checkout_note_placeholder: "Özel istekleriniz var mı?",
    track_placed: "Sipariş Alındı", track_accepted: "Aşçı Kabul Etti", track_preparing: "Hazırlanıyor", track_ready: "Teslimata Hazır", track_courier: "Kurye Atandı", track_picked: "Kurye Teslim Aldı", track_on_way: "Yolda", track_delivered: "Teslim Edildi",
    cook_orders: "Sipariş", cook_rating: "Puan", cook_prep_time: "Hazırlık Süresi", cook_availability: "Müsait", cook_verified: "Doğrulanmış", cook_response_time: "Yanıt Süresi", cook_repeat_customers: "Tekrar Müşteri", cook_specialties: "Uzmanlıklar", cook_gallery: "Yemek Galerisi", cook_reviews: "Değerlendirmeler",
    rating_food: "Yemek Kalitesi", rating_speed: "Hız", rating_packaging: "Ambalaj", rating_communication: "İletişim",
    dish_ingredients: "Malzemeler", dish_spice_level: "Acı Seviyesi", dish_prep_time: "Hazırlık Süresi", dish_sauces: "Mevcut Soslar", dish_drinks: "Mevcut İçecekler", dish_verified_photo: "Canlı Doğrulanmış Fotoğraf", dish_from_gallery: "Galeriden Fotoğraf",
    become_title: "HomeTaste'de Aşçı Ol", become_subtitle: "Özgün tariflerini paylaş ve kazanç sağla", form_full_name: "Ad Soyad", form_email: "E-posta", form_phone: "Telefon Numarası", form_country_origin: "Memleketin", form_city: "Yaşadığın Şehir", form_bio: "Hakkında", form_bio_placeholder: "Kendini ve mutfağını anlat...", form_dishes: "Hangi yemekleri yapıyorsunuz?", form_dishes_placeholder: "Örn: Dolma, Kebap, Börek...", form_availability: "Uygun Saatler", form_availability_placeholder: "Örn: Pzt-Cmt, 12:00-20:00", form_prep_time: "Ortalama Hazırlık Süresi", form_prep_placeholder: "Örn: 45 dakika", form_photo: "Profil Fotoğrafı", form_submit: "Hemen Aşçı Olmaya Başla",
    photo_camera: "Fotoğraf Çek (Doğrulanmış)", photo_gallery: "Galeriden Yükle", photo_verified_hint: "Kamerayla çekilen fotoğraflar Doğrulanmış rozeti alır",
    welcome_title: "HomeTaste'e Hoş Geldiniz", welcome_subtitle: "Önce bize nerede olduğunuzu söyleyin", welcome_country_prompt: "Şu an hangi ülkedesiniz?", welcome_city_prompt: "Hangi şehirdesiniz?", welcome_cuisine_prompt: "Bugün hangi mutfağı istiyorsunuz?", welcome_cta: "Yemeğimi Bul", welcome_skip: "Tümüne Göz At",
    filter_title: "Filtreler", filter_cuisine: "Mutfak Türü", filter_price: "Fiyat Aralığı", filter_rating: "Min. Puan", filter_prep: "Maks. Hazırlık Süresi", filter_available: "Şimdi Müsait", filter_halal: "Yalnızca Helal", filter_vegan: "Vegan", filter_spicy: "Acılı", filter_apply: "Filtrele", filter_reset: "Sıfırla",
    auth_login_title: "Tekrar Hoş Geldiniz", auth_signup_title: "Hesap Oluştur", auth_email: "E-posta adresi", auth_password: "Şifre", auth_name: "Ad Soyad", auth_have_account: "Zaten hesabınız var mı?", auth_no_account: "Hesabınız yok mu?",
    chat_title: "Mesajlar", chat_placeholder: "Mesaj yazın...", chat_quick_1: "Şu an müsait misiniz?", chat_quick_2: "Ne kadar sürer?", chat_quick_3: "Daha az acılı yapabilir misiniz?", chat_quick_4: "Kapıdayım", chat_online: "Çevrimiçi", chat_offline: "Çevrimdışı",
    toast_added_cart: "Sepete eklendi!", toast_removed_cart: "Sepetten çıkarıldı", toast_order_placed: "Siparişiniz başarıyla alındı!", toast_saved: "Başarıyla kaydedildi", toast_error: "Bir şeyler yanlış gitti", toast_copied: "Kopyalandı!", toast_fav_added: "Favorilere eklendi", toast_fav_removed: "Favorilerden çıkarıldı",
    settings_title: "Ayarlar", settings_language: "Dil", settings_notifications: "Bildirimler", settings_order_updates: "Sipariş Güncellemeleri", settings_new_dishes: "Yeni Yemekler", settings_promotions: "Promosyonlar", settings_currency: "Para Birimi", settings_theme: "Tema",
    help_title: "Yardım ve Destek", help_live_chat: "Canlı Sohbet", help_email: "Bize Yaz", help_call: "Bizi Ara", help_faq: "Sıkça Sorulan Sorular",
    loading: "Yükleniyor...", no_results: "Sonuç bulunamadı", error_generic: "Bir hata oluştu. Lütfen tekrar deneyin.", min: "dk", reviews: "değerlendirme", orders_completed: "sipariş tamamlandı"
  }
};

let currentLang = localStorage.getItem("ht_lang") || "en";

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
    || TRANSLATIONS.en[key]
    || key;
}

function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

function setLang(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : "en";
  localStorage.setItem("ht_lang", currentLang);
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  updateLangButtons();
  applyTranslations();
  document.dispatchEvent(new CustomEvent("langchange", { detail: currentLang }));
}

function getLang() { return currentLang; }

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nLabel));
    el.setAttribute("title", t(el.dataset.i18nLabel));
  });
  updateLangButtons();
}

function initLang() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  applyTranslations();
}

document.addEventListener("langchange", () => applyTranslations());
document.addEventListener("DOMContentLoaded", initLang);

window.TRANSLATIONS = TRANSLATIONS;
window.t = t;
window.setLang = setLang;
window.getLang = getLang;
window.applyTranslations = applyTranslations;
window.initLang = initLang;
