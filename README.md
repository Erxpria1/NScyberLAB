# NScyberLab - Kişisel İnşaat Mühendisliği Asistanı

**Version:** 1.0.0
**Platform:** iOS (Expo SDK 54)
**Language:** TypeScript

## Proje Hakkında

Mühendislik hesaplamaları, görselleştirme ve eğitim materyali yönetimi için retro terminal temalı mobil uygulama.

## 🎨 Tasarım Dili

- **Amber CRT** estetiği (80'ler retro-futuristik)
- **CLI-Style** arayüz
- Monospace font + scanline efektleri

## 📦 Modüller

| Modül | Açıklama |
|-------|----------|
| **BEAM** | Kiriş hesaplama (Support Reactions) |
| **TRUSS** | Kafes sistem çözücü (Truss Solver) |
| **3D** | 3D görselleştirme (Buckling modları) |
| **PDF** | Akademik kütüphane (PDF Reader) |
| **CALC** | Birim dönüştürücü + hesap makinesi |
| **HELP** | Sistem bilgileri ve kullanım kılavuzu |

## 🚀 Kurulum

```bash
npm install
npm start
```

iOS için:
```bash
npm run ios
```

## 📁 Proje Yapısı

```
NScyberLab/
├── app/              # Expo Router dosya tabanlı routing
├── components/       # UI bileşenleri
├── modules/          # İş modülleri (beam, truss, pdf)
├── utils/            # Yardımcı fonksiyonlar
├── types/            # TypeScript tip tanımlamaları
└── assets/           # Fontlar, ikonlar, görseller
```

## 🔧 Teknoloji Stack

- **React Native** 0.76+ (New Architecture)
- **Expo** SDK 54
- **Expo Router** v4 (File-based routing)
- **Skia** (@shopify/react-native-skia) - 2D çizim
- **Zustand** - State management
- **Math.js** - Matematiksel işlemler
- **TypeScript** 5.3

## 📝 Lisans

MIT
