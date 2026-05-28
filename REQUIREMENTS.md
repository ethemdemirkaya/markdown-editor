# Markdown Editor — Requirements

Tauri 2.0 + Svelte + TypeScript ile geliştirilen, masaüstü (Windows / macOS / Linux) markdown editörü.

## 1. Teknoloji Yığını

- **Runtime / Shell:** Tauri 2.0 (Rust backend)
- **Frontend:** Svelte 4 + TypeScript + Vite
- **Editor:** CodeMirror 6 (markdown mode)
- **Markdown render:** `marked` + `DOMPurify`
- **Syntax highlight:** `highlight.js`
- **Paket yöneticisi:** npm

## 2. Fonksiyonel Gereksinimler

### 2.1 Editör
- CodeMirror 6 tabanlı, markdown sözdizimi vurgulamalı editör
- Satır numaraları, kelime kaydırma (soft wrap)
- Klavye kısayolları: `Ctrl/Cmd+S` (kaydet), `Ctrl/Cmd+O` (aç), `Ctrl/Cmd+N` (yeni), `Ctrl/Cmd+W` (sekme kapat), `Ctrl/Cmd+T` (yeni sekme)

### 2.2 Canlı Önizleme (Live Preview)
- Ekran ikiye bölünmüş: solda editör, sağda render edilmiş HTML çıktısı
- Yazıldıkça anlık güncellenir (debounce ~100 ms)
- `marked` ile parse, `DOMPurify` ile XSS'e karşı sanitize edilir
- GFM (GitHub Flavored Markdown) destekli: tablolar, görev listeleri, çizgili metin

### 2.3 Kod Bloğu Syntax Highlight
- Önizlemedeki ```dil ... ``` blokları `highlight.js` ile renklendirilir
- Dark/light temaya göre uygun stylesheet yüklenir

### 2.4 Tema
- Dark / Light mod, başlık çubuğundaki butonla anlık geçiş
- Tema tercihi `localStorage`'da saklanır
- Hem editör (CodeMirror teması) hem önizleme hem highlight.js teması birlikte değişir

### 2.5 Dosya İşlemleri (Tauri FS API)
- **Aç:** `Ctrl/Cmd+O` → native dosya seçici → `.md` / `.markdown` / `.txt`
- **Kaydet:** `Ctrl/Cmd+S` → varolan yola yazar; yol yoksa "Kaydet" diyaloğu
- **Farklı kaydet:** menüden, her zaman diyalog açar
- Pencere başlığında aktif dosya adı ve değişiklik göstergesi (`●`)
- Kaydedilmemiş değişiklikler varken sekme/uygulama kapatılırsa onay

### 2.6 Çoklu Sekme (Multi-Tab)
- Birden fazla dosya aynı anda açılabilir
- Sekme üst barda gösterilir; her sekme: dosya adı, kapat butonu (`×`), dirty göstergesi
- Sekmeler arası geçiş tıklayarak ya da `Ctrl+Tab`
- Yeni sekme: `Ctrl+T` ya da `+` butonu

### 2.7 HTML Export
- Mevcut belgenin render edilmiş halini bağımsız, stil gömülü `.html` dosyası olarak dışa aktarır
- Tauri "Kaydet" diyaloğu ile yol seçilir
- Çıktı self-contained (CSS embed)

## 3. Fonksiyonel Olmayan Gereksinimler

- **Performans:** 10k satırlık markdown'da editör ve önizleme akıcı kalmalı
- **Güvenlik:** Önizlemede tüm HTML `DOMPurify` ile temizlenir; harici JS çalıştırılmaz
- **Boyut:** Tauri ile son `.exe` / bundle < 15 MB hedef
- **Erişilebilirlik:** Klavye ile tüm temel akışlar tamamlanabilmeli

## 4. Geliştirme Aşamaları (Push Planı)

Her aşama tamamlandığında ayrı bir commit ile `main` branch'e push edilir.

1. **Requirements** — bu dosya
2. **Proje iskeleti** — Tauri 2.0 + Svelte + TS scaffold, `npm run tauri dev` çalışır halde
3. **Editör + canlı önizleme** — CodeMirror, marked, DOMPurify, split layout
4. **Syntax highlighting** — highlight.js entegrasyonu
5. **Tema sistemi** — dark/light toggle + localStorage persist
6. **Dosya aç/kaydet** — Tauri FS + dialog plugin
7. **Çoklu sekme** — tab bar, state yönetimi
8. **HTML export** — self-contained dışa aktarma

## 5. Dizin Yapısı (hedef)

```
markdown-editor/
├── src/                    # Svelte frontend
│   ├── lib/
│   │   ├── Editor.svelte
│   │   ├── Preview.svelte
│   │   ├── TabBar.svelte
│   │   └── stores.ts
│   ├── App.svelte
│   └── main.ts
├── src-tauri/              # Rust backend
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── REQUIREMENTS.md
└── README.md
```
