<div align="center">

# Markdown Editor

Modern, native, WYSIWYG markdown editor for Windows / macOS / Linux.<br>
Built with **Tauri 2** + **Svelte 5** + **TypeScript** + **Milkdown Crepe**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8DB?logo=tauri&logoColor=white)](https://tauri.app/)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Release](https://img.shields.io/github/v/release/ethemdemirkaya/markdown-editor)](https://github.com/ethemdemirkaya/markdown-editor/releases)
[![Downloads](https://img.shields.io/github/downloads/ethemdemirkaya/markdown-editor/total)](https://github.com/ethemdemirkaya/markdown-editor/releases)

**Türkçe** · [English](README.md)

[İndir](https://github.com/ethemdemirkaya/markdown-editor/releases/latest) ·
[Özellikler](#özellikler) ·
[Kısayollar](#kısayollar) ·
[Geliştirme](#geliştirme)

</div>

---

## Neden bu editör?

- **WYSIWYG** — yazdığın gibi görünür; kod bloğu, başlık, liste, tablo, matematik anında render edilir.
- **Native masaüstü uygulaması** — Electron değil, Tauri. Bundle boyutu **~5 MB**, RAM kullanımı çok düşük, native pencere ve OS entegrasyonu.
- **Sıfır veri kaybı** — otomatik disk kaydı + oturum snapshot'ı; uygulama çöker veya kapanırsa tüm açık sekmeler aynen geri yüklenir.
- **Ayarlanabilir** — `@` davranışı, autosave, içindekiler paneli, kapatma onayı tek bir Ayarlar panelinden açılıp kapanır.
- **Kaynak görünümü** — `Ctrl+E` ile WYSIWYG ↔ ham markdown arasında geçiş, gerçek `#`, `**`, ` ``` ` syntax'ını gör.

## Özellikler

### Düzenleme
- WYSIWYG markdown — Milkdown Crepe (ProseMirror)
- Source görünümü toggle (`Ctrl+E`) — ham markdown'ı edit et
- **`@` ile blok menüsü** — iki seçenek:
  - **Yeni paragraph** (default): standart slash menüsü davranışı
  - **Inline popup**: cursor pozisyonunda Notion-benzeri menü, klavye filtresiyle 17 öğe
- KaTeX matematik — satır içi `$...$` ve blok `$$...$$`
- Kod blokları — **otomatik dil algılama** (highlight.js), satır kaydırma, kopyala butonu
- Drag-handle ile blokları yeniden sırala
- GFM desteği — tablolar, görev listeleri, çizgili metin

### Dosya & Oturum
- Aç / Kaydet / Farklı kaydet — native dialog
- **Otomatik kayıt** — 1.5 sn debounced, sadece yola sahip dosyalar
- **Oturum kurtarma** — tüm açık sekmeler localStorage snapshot'ında; yeniden açılışta restore
- **Çoklu sekme** — sınırsız, sekmeler arası `Ctrl+Tab`
- **Son 10 dosya** menüsü (`Ctrl+R`)
- **Kapatma onayı** — kaydedilmemiş değişiklikler varken uyarı
- **OS ilişkilendirmesi** — `.md` / `.markdown` / `.mdown` / `.mkd` çift tıkla doğrudan açılır
- **Single-instance** — birden fazla dosyaya çift tıklasan yeni sekme olarak aynı pencerede açılır

### Navigasyon
- **İçindekiler paneli** — başlık ağacı, tek tıkla scroll
- **Bul / Değiştir** — regex, case-sensitive, eşleşme sayacı (`Ctrl+F` / `Ctrl+H`)

### Görünüm
- Dark / Light tema, tercih kalıcı
- Spellcheck kapalı (Türkçe metinlerde kırmızı çizgi yok)
- Modern, gradyansız ikon

### Dışa aktarım
- **HTML** — self-contained, KaTeX + highlight.js CSS gömülü
- **PDF** — temiz iframe + browser print dialog (Chrome kalitesinde)

## Kısayollar

| Kısayol | İşlev |
|---|---|
| `Ctrl/Cmd + N` veya `+T` | Yeni sekme |
| `Ctrl/Cmd + W` | Aktif sekmeyi kapat |
| `Ctrl/Cmd + Tab` | Sıradaki sekme |
| `Ctrl/Cmd + O` | Dosya aç |
| `Ctrl/Cmd + S` | Kaydet |
| `Ctrl/Cmd + Shift + S` | Farklı kaydet |
| `Ctrl/Cmd + R` | Son dosyalar menüsü |
| `Ctrl/Cmd + F` | Bul |
| `Ctrl/Cmd + H` | Değiştir |
| `Ctrl/Cmd + P` | PDF olarak yazdır |
| `Ctrl/Cmd + E` | Source / WYSIWYG toggle |
| `@` | Editörde blok menüsünü aç |
| `Esc` | Aktif panel / menüyü kapat |

## Kurulum

**[Releases sayfasından](https://github.com/ethemdemirkaya/markdown-editor/releases/latest)** son sürümü indir:

| Platform | Paket |
|---|---|
| Windows (kullanıcı bazlı) | `Markdown Editor_X.Y.Z_x64-setup.exe` (NSIS, küçük, önerilen) |
| Windows (kurumsal) | `Markdown Editor_X.Y.Z_x64_en-US.msi` (MSI, GPO dağıtımı için) |

Kurulum sırasında `.md` / `.markdown` / `.mdown` / `.mkd` dosya ilişkilendirmesi otomatik kurulur.

## Geliştirme

### Gereksinimler
- [Node.js](https://nodejs.org/) 22+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Windows için [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), Linux için `webkit2gtk` + build-essential, macOS için Xcode CLI

### Çalıştırma

```bash
git clone https://github.com/ethemdemirkaya/markdown-editor.git
cd markdown-editor
npm install
npm run tauri dev      # hot-reload development
npm run tauri build    # production build (MSI / NSIS / .dmg / .deb / .AppImage)
```

### İkon yeniden üretme

İkon yalnızca [src-tauri/icons/icon.svg](src-tauri/icons/icon.svg) içinde tanımlı. Değiştirmek için:

```bash
node scripts/generate-icons.mjs           # SVG → PNG + NSIS BMPs
npx @tauri-apps/cli icon src-tauri/icons/icon-source.png -o src-tauri/icons
```

## Proje yapısı

```
markdown-editor/
├─ src/                       # Svelte 5 frontend
│  ├─ lib/
│  │  ├─ WysiwygEditor.svelte   # Milkdown Crepe sarmalayıcı
│  │  ├─ SourceView.svelte      # Kaynak (textarea) görünüm
│  │  ├─ TabBar.svelte          # Sekme barı
│  │  ├─ OutlinePanel.svelte    # İçindekiler
│  │  ├─ FindReplace.svelte     # Bul / Değiştir overlay
│  │  ├─ InlineBlockMenu.svelte # `@` inline popup
│  │  ├─ SettingsPanel.svelte   # ⚙ Ayarlar modali
│  │  ├─ autosave.ts            # Debounced disk + snapshot
│  │  ├─ documents.ts           # Multi-tab doc state
│  │  ├─ export.ts              # HTML / PDF self-contained
│  │  ├─ cli.ts                 # CLI args + open-files event
│  │  ├─ auto-language.ts       # ProseMirror plugin: hljs auto-detect
│  │  ├─ theme.ts               # Dark/light store
│  │  ├─ settings.ts            # Settings store
│  │  └─ ...
│  └─ routes/+page.svelte       # Ana sayfa
├─ src-tauri/                 # Rust backend
│  ├─ src/lib.rs                # Plugin init + force_exit + get_startup_files
│  ├─ icons/
│  │  ├─ icon.svg               # Tek kaynak ikon
│  │  ├─ nsis-header.bmp        # Installer banner
│  │  └─ nsis-sidebar.bmp       # Installer welcome image
│  ├─ tauri.conf.json           # Bundle / fileAssociations / NSIS config
│  └─ capabilities/default.json # Tauri izinleri
├─ scripts/
│  └─ generate-icons.mjs        # SVG → PNG + BMP üretici
└─ REQUIREMENTS.md
```

## Teknoloji yığını

| Katman | Kütüphane |
|---|---|
| Runtime | [Tauri 2](https://tauri.app/) (Rust) |
| Frontend | [Svelte 5 + SvelteKit](https://svelte.dev/) (adapter-static, SPA), TypeScript, Vite |
| WYSIWYG | [Milkdown Crepe](https://milkdown.dev/) (ProseMirror) |
| Markdown render | [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) |
| Syntax highlight | [highlight.js](https://highlightjs.org/) |
| Matematik | [KaTeX](https://katex.org/) |
| Tauri eklentileri | `plugin-dialog`, `plugin-fs`, `plugin-opener`, `plugin-single-instance` |

## Yol haritası

- [ ] Görsel yapıştırma & drag-drop (clipboard → assets klasörü)
- [ ] Klasör / workspace sidebar (file tree)
- [ ] Mermaid diyagram desteği
- [ ] Quick Command Palette (`Ctrl+Shift+P`)
- [ ] Wiki-link `[[Note]]` + backlinks paneli
- [ ] AI yardımı (özet, çeviri) — Crepe `Feature.AI`
- [ ] macOS & Linux release binary'leri

## Katkı

Pull request'ler ve issue'lar açıktır. Büyük değişiklikler için önce bir issue açarak tartışalım.

## Lisans

[MIT](LICENSE) © Ethem Demirkaya
