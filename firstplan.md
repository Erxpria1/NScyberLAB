# PROJE PLANLAMA DOKÜMANI: KİŞİSEL İNŞAAT MÜHENDİSLİĞİ ASİSTANI (V1.0)

**Tarih:** 29 Ocak 2026  
**Hazırlayan:** Akademik Danışman (Yapay Zeka Asistanı)  
**Hedef Platform:** iOS (Expo Go SDK 54)  
**Konsept:** Mühendislik hesaplamaları, görselleştirme ve eğitim materyali yönetimi.

---

## 1. GİRİŞ VE VİZYON

Değerli Öğrencim,

Bu proje, sadece bir mobil uygulama geliştirme süreci değil, aynı zamanda mühendislik nosyonunuzu dijital dünyaya aktarma girişimidir. 2026 yılı itibarıyla mobil teknolojiler, "Native" performansa hiç olmadığı kadar yakındır. Expo SDK 54 ile "New Architecture" (Yeni Mimari) artık varsayılan standarttır ve bu bize C++ modülleri üzerinden yüksek performanslı hesaplama imkanı tanır.

Hedefimiz; analitik hesaplamaları (Truss, Buckling) görsel zenginlikle sunan ve akademik gelişiminizi destekleyen (PDF/Notlar) hibrit bir "Mühendislik İsviçre Çakısı" yaratmaktır.

---

## 2. TEKNOLOJİ STACK (2026 STANDARTLARI)

Aşağıdaki kütüphaneler, kararlılık, performans ve 2026 yılı ekosistem uyumluluğu gözetilerek seçilmiştir.

### A. Çekirdek (Core)

- **Framework:** React Native 0.76+ (New Architecture Enabled)
- **Platform:** Expo SDK 54
- **Language:** TypeScript 6.0 (Tip güvenliği mühendislik hassasiyeti için şarttır)
- **Routing:** Expo Router v5 (Dosya tabanlı, web benzeri navigasyon yapısı)
- **State Management:** Legend-State veya Zustand (Hızlı, atomik state yönetimi - kompleks hesaplamalar için ideal)

### B. Mühendislik Hesaplamaları ve Görselleştirme (Kritik Bölüm)

_Bu bölüm uygulamanızın kalbidir. Truss (kafes sistem) ve Buckling (burkulma) analizleri için milimetrik çizim ve anlık render gerekir._

1.  **2D Çizim ve Fizik Motoru:**
    - **Kütüphane:** `@shopify/react-native-skia`
    - **Neden:** 2026'da Canvas API'nin yerini tamamen almıştır. Truss sistemlerini çizerken (düğüm noktaları, çubuklar) 120 FPS akıcılık sağlar. Yük dağılımı (Support Reaction) oklarını ve moment diyagramlarını çizmek için en profesyonel araçtır.

2.  **3D Görselleştirme (Buckling/Deformasyon):**
    - **Kütüphane:** `@react-three/fiber` (R3F) & `expo-gl`
    - **Neden:** Burkulma modlarını (mode shapes) 3 boyutlu göstermek için WebGL tabanlı bu kütüphane şarttır. Telefonda konsol kalitesinde 3D yapı analizi sunar.

3.  **Matematiksel İşlemler:**
    - **Kütüphane:** `mathjs` (veya varsa native C++ binding'li `react-native-quick-math`)
    - **Neden:** Matris çözümlemeleri (Stiffness Matrix Method) için buna ihtiyacımız var. Kafes sistem çözümleri, lineer denklem takımlarının çözümüne dayanır.

### C. Dokümantasyon ve Ders Notları

_Ders notlarını yükleyip üzerine not alabileceğiniz bir modül._

1.  **PDF Görüntüleme:**
    - **Kütüphane:** `react-native-pdf` (veya Expo'nun native `expo-document-viewer` modülü)
    - **Özellik:** Yüksek performanslı render, zoom ve sayfa geçişleri.
2.  **Dosya Yönetimi:**
    - **Kütüphane:** `expo-file-system`
    - **Özellik:** Ders notlarını cihazda (Local Storage) saklamak ve çevrimdışı erişmek için.

---

## 3. MODÜLER GELİŞTİRME PLANI (FIRSTPLAN)

Projeyi akademik bir tez disipliniyle fazlara ayırıyoruz.

### FAZ 1: Temel ve Statik Hesaplama (Support Reactions)

- **Amaç:** Basit kiriş (beam) sistemlerinde mesnet tepkilerini hesaplayan arayüz.
- **UI:** Kullanıcı kiriş uzunluğunu girer, yükleri (tekil/yayılı) ekler.
- **Logic:** Denge denklemleri ($\sum F_x=0, \sum F_y=0, \sum M=0$) arkada çalışır. Skia ile serbest cisim diyagramı (FBD) çizilir.

### FAZ 2: Kafes Sistem Analizi (Truss Solver)

- **Amaç:** Düğüm noktaları yöntemi ile çubuk kuvvetlerini bulma.
- **Teknik:** Kullanıcı ekrana dokunarak düğüm (node) ve çubuk (member) ekler. Matris metodu ile sistem çözülür. Basınç (Compression) ve Çekme (Tension) çubukları farklı renklerde (Kırmızı/Mavi) boyanır.

### FAZ 3: Akademik Kütüphane (PDF Reader)

- **Amaç:** "Çelik Yapılar", "Mukavemet" gibi derslerin PDF notlarını kategorize edip saklama.
- **Özellik:** Uygulama içi basit bir "Bookshelf" (Kitaplık) görünümü.

---

## 4. ÖNERİLEN "YARDIMCI ALETLER" LİSTESİ

Bir mühendisin çantasında (toolbar) olması gereken dijital aletler:

1.  **Birim Dönüştürücü (Unit Converter):** (kN $\leftrightarrow$ kgf, MPa $\leftrightarrow$ psi). Hızlı erişim için "Floating Action Button" olarak eklenmeli.
2.  **Profil Cetveli:** Standart çelik profillerin (IPE, HEA, HEB) kesit özelliklerini (Atalet momenti, Kesit alanı) içeren offline veritabanı (JSON formatında tutulabilir).
3.  **Interpolasyon Hesaplayıcı:** Tablo okumaları için lineer interpolasyon aracı.

---

## 5. SONUÇ VE TAVSİYELER

Değerli meslektaşım, bu uygulama sadece bir yazılım projesi değil, kendi öğrenme sürecinizin yaşayan bir özetidir. 2026 teknolojileri (Skia, R3F) ile yapacağınız bu görselleştirmeler, klasik "veri gir -> sonuç al" uygulamalarından çok daha öğretici olacaktır.

İlk adım olarak; "Hello World" demek yerine, ekrana bir kiriş çizip üzerine bir kuvvet oku yerleştirmeyi deneyelim.

Başarılar dilerim.
