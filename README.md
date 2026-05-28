# Markdown Editor

Tauri 2.0 + Svelte + TypeScript ile yazılmış, Milkdown Crepe tabanlı WYSIWYG markdown editörü.

## Özellikler

- **WYSIWYG düzenleme** — Milkdown Crepe (ProseMirror) tabanlı, yazıldığı gibi görünür
- **`@` ile blok menüsü** — kod bloğu, başlık, liste, tablo, matematik, görsel vb. ekle
- **KaTeX matematik** — satır içi `$...$` ve blok `$$...$$`
- **Kod bloklarında otomatik dil algılama** — highlight.js ile içeriği tanır
- **Dark / Light tema** — tercih kalıcı
- **Çoklu sekme** — birden fazla dosya aynı anda
- **Dosya işlemleri** — aç, kaydet, farklı kaydet
- **Otomatik kayıt** — yazıldıkça diske ve oturum snapshot'ına yazılır; uygulama yeniden açılınca tüm sekmeler restore edilir
- **Kapatma onayı** — kaydedilmemiş değişiklikler varken çıkışta uyarı
- **Son dosyalar** — son 10 dosya hızlı erişim
- **İçindekiler paneli** — başlık ağacında tek tıkla atla
- **Bul / Değiştir** — regex, case-sensitive, navigasyon
- **HTML & PDF dışa aktarım** — KaTeX + highlight.js stilleri gömülü, self-contained
- **OS dosya ilişkilendirmesi** — `.md` / `.markdown` çift tıkla doğrudan uygulamada açılır

## Kısayollar

| Kısayol | İşlev |
|---|---|
| `Ctrl/Cmd+N` veya `+T` | Yeni sekme |
| `Ctrl/Cmd+W` | Aktif sekmeyi kapat |
| `Ctrl/Cmd+Tab` | Sıradaki sekme |
| `Ctrl/Cmd+O` | Dosya aç |
| `Ctrl/Cmd+S` | Kaydet |
| `Ctrl/Cmd+Shift+S` | Farklı kaydet |
| `Ctrl/Cmd+R` | Son dosyalar menüsü |
| `Ctrl/Cmd+F` | Bul |
| `Ctrl/Cmd+H` | Değiştir |
| `Ctrl/Cmd+P` | PDF olarak yazdır |
| `@` | Editörde blok menüsünü aç |

## Geliştirme

```bash
npm install
npm run tauri dev      # Hot-reload geliştirme
npm run tauri build    # Üretim derlemesi (MSI / NSIS / .exe)
```

## Teknoloji Yığını

- [Tauri 2.0](https://tauri.app/) — Rust backend, native pencere ve OS entegrasyonu
- [Svelte 5 + SvelteKit](https://svelte.dev/) (adapter-static, SPA modu) + TypeScript
- [Milkdown Crepe](https://milkdown.dev/) — WYSIWYG markdown editör (ProseMirror)
- [highlight.js](https://highlightjs.org/) — kod bloğu vurgulama + otomatik dil algılama
- [KaTeX](https://katex.org/) — matematik render
- [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) — HTML/PDF export

## Lisans

MIT
