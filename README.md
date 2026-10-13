<div align="center">

<img src="assets/daisy.svg" width="96" height="96" alt="Daisy Logo" />

```text
  ___   _   ___  ___ _   _ 
 |   \ /_\ |_ _|/ __| | | |
 | |) / _ \ | | \__ \ |_| |
 |___/_/ \_\___||___/\__, |
                     |___/ 
```

### ✦ DAISY.EXE // NAUTILUS TUI FILE MANAGER // SYSTEM 98 ✦

**[ English ]** • [ Português (pt-BR) ](README.pt-BR.md)

[![Bun](https://img.shields.io/badge/Bun-%E2%89%A51.4-000000?style=flat-square&logo=bun)](https://bun.sh)
[![Engine](https://img.shields.io/badge/Engine-OpenTUI%20%2B%20Solid.js-00126b?style=flat-square)](https://github.com/opentui)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Biome](https://img.shields.io/badge/Style-Biome-60A5FA?style=flat-square&logo=biome)](https://biomejs.dev)
[![Tests](https://img.shields.io/badge/Tests-113%20passing-00e575?style=flat-square)]()
[![System](https://img.shields.io/badge/System-Windows%2098%20%2F%20The%20Wired-ff2a85?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-ffe500?style=flat-square&labelColor=00126b)](LICENSE)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ SYS_STATUS: ONLINE // THE WIRED PROTOCOL 1.4              ▰▰▰▰▰▰▱▱ [ _ ][ □ ][ ✕ ] ║
║ ARCHITECTURE: x86_64 STANDALONE // GLIBC + MUSL // APPIMAGE // FLATPAK       ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

</div>

A high-performance, accessible, and ergonomic terminal file manager (TUI) merging the spatial navigation and visual clarity of **Nautilus (GNOME Files)** with a retro-cyberpunk aesthetic drawn from ***The Wired* (Serial Experiments Lain)** and classic 1998 desktop environments.

Built from scratch using **OpenTUI**, **Solid.js (1.9.12)**, and **TypeScript**, executing with bare-metal speed atop the **Bun** runtime.

---

## 🖳 [ 01 // QUICK INSTALLATION ]

### ✦ One-Line Automated Installer

Install or update Daisy instantly with a single terminal command:

```sh
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash
```

*(Or using `wget`: `wget -qO- https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash`)*

The interactive installer provides:
- **Release Version Selection**: Installs the latest stable build (`v0.1.0`) or allows choosing any release tag.
- **Distribution Format Selection**:
  - `[1]` **Standalone Native Binary** *(Recommended)*: Fast setup in `~/.local/bin/daisy` (no root privileges required).
  - `[2]` **Native Distro Package**: Automatically detects your distribution and installs through your native package manager (`.pkg.tar.zst` on Arch Linux, `.deb` on Debian/Ubuntu, `.rpm` on Fedora).
  - `[3]` **AppImage**: Universal, portable, self-contained executable.
  - `[4]` **Flatpak Bundle**: Sandboxed and isolated application deployment.
- **Cryptographic Validation**: Pre-install SHA-256 integrity verification.
- **Desktop Environment Integration (XDG)**: Automatically registers a `.desktop` shortcut and installs the desktop icon into your system app launcher (GNOME, KDE, Rofi, wofi, etc.).

#### Non-Interactive / CI / Script Automation
```sh
# Express non-interactive install (recommended defaults)
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --yes

# Specify version and target format via flags
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --version v0.1.0 --format binary
```

---

## 🗔 [ 02 // FEATURES & SUBSYSTEMS ]

### 🗀 02.1 // Nautilus-Style Navigation & Layout
- **Display Modes**: Toggle between detailed tabular list and responsive icon grid (<kbd>v</kbd>).
- **Dual-Pane (Split-Pane)**: Split screen horizontally (<kbd>F3</kbd>) with independent directory sessions and seamless <kbd>Tab</kbd> switching.
- **Complete Sidebar**:
  - `01 // Places`: Home, Documents, Downloads, Music, Pictures, Videos, Desktop, Root, and System Trash.
  - `02 // Bookmarks`: Pin and unpin directories to/from favorites with a single keystroke (<kbd>b</kbd>).
  - `03 // Drives`: Dynamic hardware detection for external disks, USB drives, and mount points with safe ejection (<kbd>⏏</kbd>).
- **Breadcrumb Navigation**: Clickable path segments in the header bar.
- **Rich Status HUD**: VU-meter signal meter, item counter, selection tracker, UNIX permissions, and live disk space metrics.

### ⌕ 02.2 // Fuzzy Search & :ex Command Console
- **Instant Fuzzy Filter**: Trigger with <kbd>/</kbd> to filter directory entries in real time with syntax match highlights.
- **Vim-Style Command Console (`:ex`)**: Press <kbd>:</kbd> to execute commands including `:cd <path>`, `:mkdir <name>`, `:touch <name>`, `:sort <criterion>`, `:theme <name>`, and `:quit`.

### 🖱 02.3 // Mouse Trapping & Context Menus
- **Context Menu**: Trigger with **Right-Click** or <kbd>m</kbd> over any item.
- **Quick Actions**: Open, Open With (custom app), Copy, Cut, Rename, Pin/Unpin Bookmark, Send to Trash, and Properties.
- **Comprehensive Focus Trap**: Modal dialogs and menus feature full-screen backdrop event capture for mouse and keyboard, preventing stray clicks or keypresses from leaking into background panes.

### 🗎 02.4 // High-Resolution Embedded PDF Reader
- Native graphical PDF page rendering via `pdftoppm`.
- **True Configurable Zoom**: Scales of 50%, 75%, 100%, 125%, 150%, 175%, 200%, 250%, and 300% with smooth viewport scrolling (`ScrollBox`).
- **Fit to Screen**: Automatic bounding box calibration (<kbd>f</kbd> or <kbd>0</kbd>) dynamically adjusting DPI (72 to 300 DPI) to fit the terminal dimensions.
- Intuitive zoom keys (<kbd>+</kbd>, <kbd>-</kbd>, <kbd>Ctrl + =</kbd>, <kbd>Ctrl + -</kbd>) or mouse <kbd>Ctrl + Scroll</kbd>.
- Extracted Text Mode (<kbd>t</kbd>) for instant lightweight viewing without graphical dependencies.

### ☵ 02.5 // Rich Markdown & Asset Previews
- **Markdown in Rich Text**: `.md` and `.markdown` files render formatted rich text (`<markdown>`) including headers, lists, blockquotes, tables, and syntax-highlighted code blocks.
- **Images**: High-resolution in-terminal rendering through modern terminal graphics protocols.
- **Code & Text Reader**: Syntax-highlighted viewer window with line numbering and smooth scrolling.
- **Archive Extraction**: One-key automatic extraction for `.tar.gz` and `.zip` archives (<kbd>Enter</kbd>).
- **Inspector Preview Panel**: Live display of file metadata, text previews, image thumbnails, and directory counts.

### 🖫 02.6 // Background I/O Operations Engine
- **Clipboard**: Copy (<kbd>y</kbd>), Cut (<kbd>d</kbd>), and Paste (<kbd>p</kbd>) with multi-selection support.
- **Copy/Move To Dialog**: Interactive destination directory browser (<kbd>F5</kbd> for copy, <kbd>F6</kbd> for move).
- **Background Queue**: Asynchronous non-blocking file transfers with progress toasts and graceful cancellation.
- **Conflict Resolution**: Interactive prompt on collisions (Overwrite, Rename, or Skip).
- **System Trash**: Recoverable file deletion integrated with `gio trash`.

### ✦ 02.7 // Live Theme Matrix (themes.exe) & A11y
- **Live Theme Switcher (`themes.exe`)**: Press <kbd>t</kbd> or <kbd>F10</kbd> to open an interactive modal with **immediate Live Preview** as you cycle through options:
  - `wired`: *The Wired / Serial Experiments Lain* palette with Electric Cobalt (`#00126b`) and Acid Yellow (`#ffe500`).
  - `cyberpunk`: Vibrant neon cyberpunk palette with Hot Magenta (`#ff2a85`) and Neon Purple (`#9d4edd`).
  - `retro`: Authentic Windows 98 workstation palette in Soft Paper (`#f1eee9`) and Classic Cobalt (`#11379f`).
  - `dark`: Clean, balanced modern dark mode.
  - `light`: Crisp, high-contrast light mode.
- **Retro Micro-HUDs**: VU-meter signal gauges `▰▰▰▰▰▱▱▱`, classic window controls `[ _ ] [ □ ] [ ✕ ]`, and technical section indexing `01 //`, `02 //`.
- **Accessibility**: High-visibility focus indicators across all widgets, verified WCAG contrast ratios, and 100% keyboard accessibility.

---

## ⌨ [ 03 // KEYBOARD MATRIX ]

| Subsystem | Keystroke | Operation |
| :--- | :--- | :--- |
| **Navigation** | <kbd>j</kbd> / <kbd>↓</kbd> | Move cursor down |
| | <kbd>k</kbd> / <kbd>↑</kbd> | Move cursor up |
| | <kbd>l</kbd> / <kbd>Enter</kbd> | Enter folder / open file viewer |
| | <kbd>h</kbd> | Navigate to parent directory |
| | <kbd>g</kbd> / <kbd>G</kbd> | Jump to first / last item |
| | <kbd>Tab</kbd> | Switch active pane (Dual-Pane Mode) |
| | <kbd>v</kbd> | Toggle view mode (List / Grid) |
| **Selection** | <kbd>Space</kbd> | Select / unselect focused item |
| | <kbd>V</kbd> | Toggle visual range selection mode |
| | <kbd>Ctrl + A</kbd> | Select all entries in directory |
| | <kbd>Ctrl + D</kbd> | Clear selection |
| **Operations** | <kbd>y</kbd> | Copy selected items to clipboard |
| | <kbd>d</kbd> | Cut selected items to clipboard |
| | <kbd>p</kbd> | Paste items from clipboard |
| | <kbd>F5</kbd> / <kbd>Shift + C</kbd> | Open Copy To directory picker |
| | <kbd>F6</kbd> / <kbd>Shift + M</kbd> | Open Move To directory picker |
| | <kbd>a</kbd> / <kbd>F2</kbd> | Rename selected item |
| | <kbd>Ctrl + N</kbd> | Create new directory (`mkdir`) |
| | <kbd>Ctrl + Shift + N</kbd> | Create new blank file (`touch`) |
| | <kbd>D</kbd> / <kbd>Delete</kbd> | Move selected items to Trash |
| | <kbd>Shift + Delete</kbd> | Permanently delete items |
| | <kbd>o</kbd> | Open with default system application (`xdg-open`) |
| | <kbd>b</kbd> | Toggle bookmark for current folder in sidebar |
| | <kbd>m</kbd> / <kbd>Menu</kbd> | Open Context Menu under cursor |
| | <kbd>i</kbd> / <kbd>Alt + Enter</kbd> | Open Properties dialog |
| **Search & Commands** | <kbd>/</kbd> | Open instant fuzzy search filter |
| | <kbd>:</kbd> | Open command console (`:cd`, `:mkdir`, `:sort`, `:theme`, etc.) |
| | <kbd>Esc</kbd> | Dismiss search, close modal, or deselect all |
| **PDF Reader** | <kbd>+</kbd> / <kbd>Ctrl + =</kbd> | Increase zoom level (+25%) |
| | <kbd>-</kbd> / <kbd>Ctrl + -</kbd> | Decrease zoom level (-25%) |
| | <kbd>f</kbd> / <kbd>Ctrl + 0</kbd> / <kbd>0</kbd> | Toggle fit-to-screen mode |
| | <kbd>j</kbd> / <kbd>↓</kbd> / <kbd>k</kbd> / <kbd>↑</kbd> | Scroll viewport when zoomed |
| | <kbd>n</kbd> / <kbd>p</kbd> | Next / previous page |
| | <kbd>t</kbd> | Toggle between graphical render and extracted text |
| **Interface** | <kbd>F9</kbd> | Toggle sidebar visibility |
| | <kbd>F3</kbd> | Toggle dual-pane (split-pane) view |
| | <kbd>t</kbd> / <kbd>Shift + T</kbd> / <kbd>F10</kbd> | Open Live Theme Switcher (`themes.exe`) |
| | <kbd>?</kbd> | Open Keyboard Help overlay |
| | <kbd>q</kbd> / <kbd>Ctrl + C</kbd> | Exit Daisy |

---

## ⚙ [ 04 // DECLARATIVE CONFIG ]

Create or edit `~/.config/daisy/config.toml` (or project-local `.daisy/config.toml`):

```toml
[theme]
name = "wired"         # "wired" | "cyberpunk" | "retro" | "dark" | "light"
icons = "nerd"         # "nerd" (Nerd Font glyphs) or "unicode"

[locale]
lang = "en-US"         # "en-US" or "pt-BR"

[editor]
command = "nvim"       # Preferred editor for text files (e.g. "nvim", "nano", "code")

[view]
default = "list"       # "list" or "grid"
show_hidden = false    # Show hidden files by default
split_pane = false     # Launch in split-pane mode

[preview]
max_text_bytes = 1048576  # Maximum preview file size (1 MB)

[keymap]
"ui.quit" = ["q", "ctrl+q"]
"view.toggleHidden" = ["H"]
```

---

## 🛠 [ 05 // BUILD & DEVELOPMENT ]

### Prerequisites
- **Bun** ≥ 1.4 (`curl -fsSL https://bun.sh/install | bash`)
- **UTF-8 Terminal** (recommended Ghostty, WezTerm, Kitty, or Alacritty with a Nerd Font)
- *(Optional)* `poppler-utils` (`pdftoppm`, `pdfinfo`) for graphical PDF rendering

### Running from Source
```sh
git clone https://github.com/raillen/daisy-file-manager.git
cd daisy-file-manager
bun install
bun run dev
```

### Quality & Verification Commands
```sh
bun run dev        # Launch interactive TUI in development mode
bun run build      # Compile standalone native binaries to dist/
bun test           # Run automated test suite (113 tests)
bun run typecheck  # Strict TypeScript typechecking (tsc --noEmit)
bun run lint       # Static analysis and formatting check via Biome
bun run verify     # Run test + typecheck + lint in sequence
```

---

## ⛁ [ 06 // SYSTEM ARCHITECTURE ]

```text
daisy-file-manager/
├── design/              # Canonical design tokens (colors.json, icons.json, i18n/*.json)
├── src/
│   ├── app/             # OpenTUI + Solid components (lean presentation layer)
│   │   ├── dialogs/     # Focus-trapped modal dialogs (PDF, Image, Text, Themes, etc.)
│   │   ├── entries/     # List and grid row/tile rendering
│   │   ├── layout/      # Window chrome, header, sidebar, footer, and split panes
│   │   └── App.tsx      # Root application component
│   ├── commands/        # Semantic command registry and keybinding engine (@opentui/keymap)
│   ├── core/            # Pure, testable domain modules (fs, pdf, preview, drives, etc.)
│   ├── state/           # Reactive Solid stores (session, ui, operations)
│   └── main.tsx         # Bootstrap entry point and terminal setup
├── packaging/           # Release packaging scripts (Arch, Fedora, Debian, AppImage, Flatpak)
├── tests/               # Comprehensive automated test suite with bun:test
└── install.sh           # Intelligent one-line installer script
```

---

## ◬ [ 07 // ROADMAP ]

To review planned features and milestones (Embedded Audio Player `player.exe`, Diff Inspector, Global Ripgrep Search, and Git Integration), see:

👉 **[ROADMAP.md](ROADMAP.md)**

---

## ⚖ [ 08 // LICENSE ]

Daisy is licensed under the **[MIT License](LICENSE)**.
