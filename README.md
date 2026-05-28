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

**English** · [Türkçe](README.tr.md)

[Download](https://github.com/ethemdemirkaya/markdown-editor/releases/latest) ·
[Features](#features) ·
[Shortcuts](#shortcuts) ·
[Development](#development)

</div>

---

## Why this editor?

- **WYSIWYG** — what you type is what you see; code blocks, headings, lists, tables and math render instantly.
- **Native desktop app** — not Electron, Tauri. Bundle size **~5 MB**, low memory footprint, native window and OS integration.
- **Zero data loss** — automatic disk save + session snapshot; if the app crashes or you close it, all open tabs are restored next launch.
- **Configurable** — `@` behavior, autosave, outline panel, close confirmation — toggle each from a single Settings panel.
- **Source view** — toggle between WYSIWYG ↔ raw markdown with `Ctrl+E` to see actual `#`, `**`, ` ``` ` syntax.
- **Multilingual UI** — pick your language from Settings (English, Türkçe, Deutsch, Français, Español).

## Features

### Editing
- WYSIWYG markdown — Milkdown Crepe (ProseMirror)
- Source view toggle (`Ctrl+E`) — edit the raw markdown directly
- **Block menu via `@`** — two modes:
  - **New paragraph** (default): standard slash-menu behavior
  - **Inline popup**: Notion-style menu at the cursor with keyboard filter, 17 items
- KaTeX math — inline `$...$` and block `$$...$$`
- Code blocks — **automatic language detection** (highlight.js), line wrapping, copy button
- **Mermaid diagrams** — ```` ```mermaid ```` code blocks render to SVG in both WYSIWYG preview and HTML/PDF export
- **GitHub Alerts** — `> [!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]` rendered both in WYSIWYG and exports
- Drag-handle to reorder blocks
- GFM — tables, task lists, strikethrough

### Files & Session
- Open / Save / Save As — native dialog
- **Autosave** — 1.5s debounced, only persisted files
- **Session restore** — all open tabs in a localStorage snapshot; restored on relaunch
- **Multi-tab** — unlimited, `Ctrl+Tab` to cycle
- **Recent 10 files** menu (`Ctrl+R`)
- **Close confirmation** — warning when unsaved changes exist
- **OS file association** — double-clicking `.md` / `.markdown` / `.mdown` / `.mkd` opens directly
- **Single-instance** — double-clicking more files opens new tabs in the same window

### Navigation
- **Workspace / file tree** — open a folder, browse and click to open files in a tab
- **Outline panel** — heading tree, click to jump
- **Find / Replace** — regex, case-sensitive, match counter (`Ctrl+F` / `Ctrl+H`)
- **Command Palette** (`Ctrl+Shift+P`) — fuzzy-searchable list of every action, every open tab, and every recent file

### Appearance
- Dark / Light theme, persistent preference
- Spellcheck disabled by default (no red wavy lines on non-English text)
- Modern, gradient-free icon

### Export
- **HTML** — self-contained, KaTeX + highlight.js CSS embedded
- **PDF** — clean iframe + browser print dialog (Chrome-quality output)

## Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + N` or `+T` | New tab |
| `Ctrl/Cmd + W` | Close active tab |
| `Ctrl/Cmd + Tab` | Next tab |
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Shift + S` | Save as |
| `Ctrl/Cmd + R` | Recent files menu |
| `Ctrl/Cmd + F` | Find |
| `Ctrl/Cmd + H` | Replace |
| `Ctrl/Cmd + P` | Print as PDF |
| `Ctrl/Cmd + Shift + P` | Command palette |
| `Ctrl/Cmd + E` | Toggle source / WYSIWYG |
| `@` | Open block menu |
| `Esc` | Close active panel / menu |

## Install

Download the latest version from the **[Releases page](https://github.com/ethemdemirkaya/markdown-editor/releases/latest)**:

| Platform | Package |
|---|---|
| Windows (per-user) | `Markdown Editor_X.Y.Z_x64-setup.exe` (NSIS, small, recommended) |
| Windows (enterprise) | `Markdown Editor_X.Y.Z_x64_en-US.msi` (MSI, for GPO deployment) |

File associations for `.md` / `.markdown` / `.mdown` / `.mkd` are installed automatically.

## Development

### Requirements
- [Node.js](https://nodejs.org/) 22+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Windows: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) · Linux: `webkit2gtk` + build-essential · macOS: Xcode CLI

### Run

```bash
git clone https://github.com/ethemdemirkaya/markdown-editor.git
cd markdown-editor
npm install
npm run tauri dev      # hot-reload development
npm run tauri build    # production build (MSI / NSIS / .dmg / .deb / .AppImage)
```

### Regenerating icons

The icon is defined only in [src-tauri/icons/icon.svg](src-tauri/icons/icon.svg). To regenerate all variants:

```bash
node scripts/generate-icons.mjs           # SVG → PNG + NSIS BMPs
npx @tauri-apps/cli icon src-tauri/icons/icon-source.png -o src-tauri/icons
```

## Project structure

```
markdown-editor/
├─ src/                       # Svelte 5 frontend
│  ├─ lib/
│  │  ├─ WysiwygEditor.svelte   # Milkdown Crepe wrapper
│  │  ├─ SourceView.svelte      # Source (textarea) view
│  │  ├─ TabBar.svelte          # Tab strip
│  │  ├─ OutlinePanel.svelte    # Outline
│  │  ├─ FindReplace.svelte     # Find / Replace overlay
│  │  ├─ InlineBlockMenu.svelte # Inline `@` popup
│  │  ├─ SettingsPanel.svelte   # ⚙ Settings modal
│  │  ├─ CommandPalette.svelte  # Ctrl+Shift+P palette
│  │  ├─ autosave.ts            # Debounced disk + snapshot
│  │  ├─ documents.ts           # Multi-tab doc state
│  │  ├─ export.ts              # HTML / PDF self-contained
│  │  ├─ cli.ts                 # CLI args + open-files event
│  │  ├─ auto-language.ts       # ProseMirror plugin: hljs auto-detect
│  │  ├─ github-alerts.ts       # Marked extension + PM decoration
│  │  ├─ theme.ts               # Dark/light store
│  │  ├─ settings.ts            # Settings store
│  │  ├─ i18n.ts                # Locale store + translations
│  │  └─ ...
│  └─ routes/+page.svelte       # Main page
├─ src-tauri/                 # Rust backend
│  ├─ src/lib.rs                # Plugin init + force_exit + get_startup_files
│  ├─ icons/
│  │  ├─ icon.svg               # Single icon source
│  │  ├─ nsis-header.bmp        # Installer banner
│  │  └─ nsis-sidebar.bmp       # Installer welcome image
│  ├─ tauri.conf.json           # Bundle / fileAssociations / NSIS config
│  └─ capabilities/default.json # Tauri permissions
├─ scripts/
│  └─ generate-icons.mjs        # SVG → PNG + BMP generator
└─ REQUIREMENTS.md
```

## Tech stack

| Layer | Library |
|---|---|
| Runtime | [Tauri 2](https://tauri.app/) (Rust) |
| Frontend | [Svelte 5 + SvelteKit](https://svelte.dev/) (adapter-static, SPA), TypeScript, Vite |
| WYSIWYG | [Milkdown Crepe](https://milkdown.dev/) (ProseMirror) |
| Markdown render | [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) |
| Syntax highlight | [highlight.js](https://highlightjs.org/) |
| Math | [KaTeX](https://katex.org/) |
| Tauri plugins | `plugin-dialog`, `plugin-fs`, `plugin-opener`, `plugin-single-instance` |

## Roadmap

- [ ] Paste & drag-drop images (clipboard → assets folder)
- [ ] Workspace context menu (new file/folder, rename, delete)
- [ ] Wiki-link `[[Note]]` + backlinks panel
- [ ] AI assistance (summarize, translate) — Crepe `Feature.AI`
- [ ] macOS & Linux release binaries

## Contributing

Pull requests and issues are welcome. For large changes please open an issue first to discuss.

## License

[MIT](LICENSE) © Ethem Demirkaya
