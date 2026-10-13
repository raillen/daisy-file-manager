<div align="center">

<img src="assets/daisy.svg" width="96" height="96" alt="Daisy Logo" />

```text
  ___   _   ___  ___ _   _ 
 |   \ /_\ |_ _|/ __| | | |
 | |) / _ \ | | \__ \ |_| |
 |___/_/ \_\___||___/\__, |
                     |___/ 
```

### ✦ DAISY.EXE // GERENCIADOR DE ARQUIVOS NAUTILUS TUI // SISTEMA 98 ✦

[ English ](README.md) • **[ Português (pt-BR) ]**

[![Bun](https://img.shields.io/badge/Bun-%E2%89%A51.4-000000?style=flat-square&logo=bun)](https://bun.sh)
[![Engine](https://img.shields.io/badge/Engine-OpenTUI%20%2B%20Solid.js-00126b?style=flat-square)](https://github.com/opentui)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Biome](https://img.shields.io/badge/Style-Biome-60A5FA?style=flat-square&logo=biome)](https://biomejs.dev)
[![Tests](https://img.shields.io/badge/Tests-113%20passing-00e575?style=flat-square)]()
[![Sistema](https://img.shields.io/badge/Sistema-Windows%2098%20%2F%20The%20Wired-ff2a85?style=flat-square)]()
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-ffe500?style=flat-square&labelColor=00126b)](LICENSE)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ SYS_STATUS: ONLINE // THE WIRED PROTOCOL 1.4              ▰▰▰▰▰▰▱▱ [ _ ][ □ ][ ✕ ] ║
║ ARQUITETURA: x86_64 STANDALONE // GLIBC + MUSL // APPIMAGE // FLATPAK        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

</div>

Gerenciador de arquivos para terminal (TUI) de alta performance, elegante e acessível, unindo a ergonomia espacial do **Nautilus (GNOME Files)** com a estética retro-cyberpunk inspirada em ***The Wired* (Serial Experiments Lain)** e desktops clássicos de 1998.

Construído do zero com **OpenTUI**, **Solid.js (1.9.12)** e **TypeScript**, rodando com velocidade nativa sobre o runtime **Bun**.

---

## 🖳 [ 01 // INSTALAÇÃO RÁPIDA ]

### ✦ One-Line Installer Automatizado

Instale ou atualize o Daisy instantaneamente com um único comando no terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash
```

*(Ou usando `wget`: `wget -qO- https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash`)*

O instalador interativo oferece:
- **Seleção de Versão**: Instala a versão estável mais recente (`v0.1.0`) ou permite selecionar qualquer release/tag específica.
- **Seleção de Formato de Pacote**:
  - `[1]` **Binário Nativo Standalone** *(Recomendado)*: Instalação rápida em `~/.local/bin/daisy` (sem necessidade de privilégios root).
  - `[2]` **Pacote Nativo da Distro**: Detecta automaticamente sua distribuição e instala via gerenciador de pacotes (`.pkg.tar.zst` no Arch Linux, `.deb` no Debian/Ubuntu, `.rpm` no Fedora).
  - `[3]` **AppImage**: Executável autocontido portátil universal.
  - `[4]` **Flatpak Bundle**: Pacote isolado em sandbox.
- **Verificação Criptográfica**: Checagem de integridade SHA-256 antes da instalação.
- **Integração com Desktop (XDG)**: Cria atalho `.desktop` e registra o ícone no lançador de aplicativos (GNOME, KDE, Rofi, wofi, etc.).

#### Instalação Não Interativa / CI / Automação
```sh
# Instalação expressa recomendada com padrões
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --yes

# Especificando versão e formato via parâmetros
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --version v0.1.0 --format binary
```

---

## 🗔 [ 02 // RECURSOS & SUBSISTEMAS ]

### 🗀 02.1 // Interface & Navegação Estilo Nautilus
- **Modos de Exibição**: Alternância instantânea entre lista detalhada e grade de ícones (<kbd>v</kbd>).
- **Painel Duplo (Split-Pane)**: Divisão de tela (<kbd>F3</kbd>) com sessões independentes e chaveamento instantâneo via <kbd>Tab</kbd>.
- **Barra Lateral Completa**:
  - `01 // Lugares`: Home, Documentos, Downloads, Músicas, Imagens, Vídeos, Área de Trabalho, Raiz e Lixeira.
  - `02 // Marcadores`: Fixe e desafixe qualquer pasta dos favoritos com um toque (<kbd>b</kbd>).
  - `03 // Dispositivos`: Detecção dinâmica de HDs externos, pendrives USB e partições montadas com ejeção segura (<kbd>⏏</kbd>).
- **Caminho & Breadcrumbs**: Navegação por segmentos interativos clicáveis no cabeçalho.
- **Barra de Status Rica**: Indicador VU-meter de sinal, total de itens, seleção, permissões UNIX e espaço livre em disco.

### ⌕ 02.2 // Busca Fuzzy & Console de Comando (:ex)
- **Filtro Fuzzy Instantâneo**: Inicie a busca com <kbd>/</kbd> e filtre diretórios em tempo real com realce de correspondências.
- **Linha de Comando Estilo Vim (`:ex`)**: Pressione <kbd>:</kbd> para executar comandos como `:cd <pasta>`, `:mkdir <nome>`, `:touch <nome>`, `:sort <critério>`, `:theme <tema>` e `:quit`.

### 🖱 02.3 // Mouse Trapping & Menu Contextual
- **Menu de Contexto**: Abra com o **botão direito do mouse** ou pressionando <kbd>m</kbd> sobre qualquer item.
- **Ações Rápidas**: Abrir, Abrir com aplicativo personalizado, Copiar, Recortar, Renomear, Fixar/Desafixar favoritos, Enviar para a Lixeira e Propriedades.
- **Focus Trap Total**: Diálogos e menus contam com backdrop em tela cheia que captura eventos de mouse e teclado, impedindo qualquer clique ou comando acidental no plano de fundo.

### 🗎 02.4 // Leitor de PDF Embutido em Alta Resolução
- Renderização visual nativa de páginas PDF via `pdftoppm`.
- **Zoom Real Configurável**: Escalas de 50%, 75%, 100%, 125%, 150%, 175%, 200%, 250% e 300% com rolagem suave (`ScrollBox`).
- **Ajuste à Tela (Fit)**: Modo de enquadramento automático (<kbd>f</kbd> ou <kbd>0</kbd>) calibrando DPI dinamicamente (72 a 300 DPI).
- Controles de zoom via atalhos (<kbd>+</kbd>, <kbd>-</kbd>, <kbd>Ctrl + =</kbd>, <kbd>Ctrl + -</kbd>) ou <kbd>Ctrl + Scroll</kbd> do mouse.
- Modo de texto extraído (<kbd>t</kbd>) para leitura rápida sem renderização gráfica.

### ☵ 02.5 // Rich Markdown & Pré-visualizações
- **Markdown em Rich Text**: Arquivos `.md` e `.markdown` são renderizados com formatação rica nativa (`<markdown>`), incluindo títulos, listas, citações, tabelas e blocos de código com destaque sintático.
- **Imagens**: Visualização em alta resolução no terminal através de protocolos gráficos modernos.
- **Texto e Código**: Janela de leitura com realce sintático, numeração de linhas e rolagem suave.
- **Arquivos Compactados**: Extração automática de `.tar.gz` e `.zip` com um toque (<kbd>Enter</kbd>).
- **Painel Lateral de Prévia**: Exibição instantânea de metadados, texto, miniaturas e contagem de itens em pastas.

### 🖫 02.6 // Motor de Operações de Arquivo em Segundo Plano
- **Área de Transferência**: Copiar (<kbd>y</kbd>), recortar (<kbd>d</kbd>) e colar (<kbd>p</kbd>) com suporte a múltiplos itens.
- **Diálogo Copiar/Mover Para**: Seleção interativa de diretório de destino (<kbd>F5</kbd> para copiar, <kbd>F6</kbd> para mover).
- **Fila em Segundo Plano**: Operações assíncronas com notificações toast de progresso e cancelamento seguro.
- **Resolução de Conflitos**: Diálogo interativo para arquivos existentes (Sobrescrever, Renomear ou Pular).
- **Lixeira do Sistema**: Integração com `gio trash` para exclusão recuperável.

### ✦ 02.7 // Matriz de Temas (themes.exe) & Acessibilidade
- **Seletor de Temas ao Vivo (`themes.exe`)**: Pressione <kbd>t</kbd> ou <kbd>F10</kbd> para abrir o modal interativo com **visualização ao vivo imediata (Live Preview)** conforme você navega entre as opções:
  - `wired`: *The Wired / Serial Experiments Lain* em Azul Cobalto elétrico (`#00126b`) e Amarelo Ácido (`#ffe500`).
  - `cyberpunk`: Estilo neon futurista em Rosa Hot Magenta (`#ff2a85`) e Roxo Neon (`#9d4edd`).
  - `retro`: Estilo clássico Windows 98 em Paper claro (`#f1eee9`) e Azul Cobalto (`#11379f`).
  - `dark`: Modo escuro moderno, equilibrado e minimalista.
  - `light`: Modo claro de alto contraste e legibilidade.
- **Micro-HUDs Retro**: Barras de sinal VU-meter `▰▰▰▰▰▱▱▱`, molduras clássicas de janela `[ _ ] [ □ ] [ ✕ ]` e numeração técnica `01 //`, `02 //`.
- **Acessibilidade**: Foco visível em todos os controles, contraste calibrado e operação 100% acessível por teclado.

---

## ⌨ [ 03 // MATRIZ DE ATALHOS ]

| Subsistema | Atalho | Operação |
| :--- | :--- | :--- |
| **Navegação** | <kbd>j</kbd> / <kbd>↓</kbd> | Mover cursor para baixo |
| | <kbd>k</kbd> / <kbd>↑</kbd> | Mover cursor para cima |
| | <kbd>l</kbd> / <kbd>Enter</kbd> | Entrar na pasta / abrir visualizador de arquivo |
| | <kbd>h</kbd> | Voltar ao diretório pai |
| | <kbd>g</kbd> / <kbd>G</kbd> | Ir para o primeiro / último item |
| | <kbd>Tab</kbd> | Alternar entre o painel esquerdo e direito (Split-Pane) |
| | <kbd>v</kbd> | Alternar modo de exibição (Lista / Grade) |
| **Seleção** | <kbd>Espaço</kbd> | Marcar / desmarcar item sob o cursor |
| | <kbd>V</kbd> | Alternar modo visual de seleção por intervalo |
| | <kbd>Ctrl + A</kbd> | Selecionar todos os itens da pasta |
| | <kbd>Ctrl + D</kbd> | Desmarcar todos os itens |
| **Operações** | <kbd>y</kbd> | Copiar seleção para a área de transferência |
| | <kbd>d</kbd> | Recortar seleção para a área de transferência |
| | <kbd>p</kbd> | Colar itens da área de transferência |
| | <kbd>F5</kbd> / <kbd>Shift + C</kbd> | Abrir diálogo para copiar itens para outra pasta |
| | <kbd>F6</kbd> / <kbd>Shift + M</kbd> | Abrir diálogo para mover itens para outra pasta |
| | <kbd>a</kbd> / <kbd>F2</kbd> | Renomear item selecionado |
| | <kbd>Ctrl + N</kbd> | Criar nova pasta (`mkdir`) |
| | <kbd>Ctrl + Shift + N</kbd> | Criar novo arquivo vazio (`touch`) |
| | <kbd>D</kbd> / <kbd>Delete</kbd> | Enviar itens selecionados para a Lixeira |
| | <kbd>Shift + Delete</kbd> | Excluir itens permanentemente |
| | <kbd>o</kbd> | Abrir arquivo com o programa padrão do sistema (`xdg-open`) |
| | <kbd>b</kbd> | Fixar ou desafixar a pasta atual nos Favoritos da barra lateral |
| | <kbd>m</kbd> / <kbd>Menu</kbd> | Abrir Menu Contextual sob o cursor |
| | <kbd>i</kbd> / <kbd>Alt + Enter</kbd> | Exibir diálogo de Propriedades e metadados |
| **Busca & Comandos** | <kbd>/</kbd> | Iniciar busca com filtro fuzzy instantâneo |
| | <kbd>:</kbd> | Abrir console de comando (`:cd`, `:mkdir`, `:sort`, `:theme`, etc.) |
| | <kbd>Esc</kbd> | Fechar busca, fechar diálogo modal ou limpar seleção |
| **Leitor de PDF** | <kbd>+</kbd> / <kbd>Ctrl + =</kbd> | Aumentar zoom (+25%) |
| | <kbd>-</kbd> / <kbd>Ctrl + -</kbd> | Reduzir zoom (-25%) |
| | <kbd>f</kbd> / <kbd>Ctrl + 0</kbd> / <kbd>0</kbd> | Alternar ajuste à tela (Fit to screen) |
| | <kbd>j</kbd> / <kbd>↓</kbd> / <kbd>k</kbd> / <kbd>↑</kbd> | Rolar página quando ampliado |
| | <kbd>n</kbd> / <kbd>p</kbd> | Próxima / página anterior |
| | <kbd>t</kbd> | Alternar entre modo visual e texto extraído |
| **Interface** | <kbd>F9</kbd> | Mostrar / ocultar barra lateral |
| | <kbd>F3</kbd> | Alternar painel duplo (split-pane) |
| | <kbd>t</kbd> / <kbd>Shift + T</kbd> / <kbd>F10</kbd> | Abrir Seletor de Temas com preview ao vivo (`themes.exe`) |
| | <kbd>?</kbd> | Abrir painel de Ajuda e atalhos |
| | <kbd>q</kbd> / <kbd>Ctrl + C</kbd> | Sair do Daisy |

---

## ⚙ [ 04 // CONFIGURAÇÃO DECLARATIVA ]

Crie ou edite o arquivo `~/.config/daisy/config.toml` (ou no diretório do projeto em `.daisy/config.toml`):

```toml
[theme]
name = "wired"         # "wired" | "cyberpunk" | "retro" | "dark" | "light"
icons = "nerd"         # "nerd" (ícones Nerd Font) ou "unicode"

[locale]
lang = "pt-BR"         # "pt-BR" ou "en-US"

[editor]
command = "nvim"       # Editor para abrir arquivos (ex: "nvim", "nano", "code")

[view]
default = "list"       # "list" ou "grid"
show_hidden = false    # Exibir arquivos ocultos por padrão
split_pane = false     # Iniciar em modo split-pane

[preview]
max_text_bytes = 1048576  # Limite de leitura de prévia (1 MB)

[keymap]
"ui.quit" = ["q", "ctrl+q"]
"view.toggleHidden" = ["H"]
```

---

## 🛠 [ 05 // COMPILAÇÃO & DESENVOLVIMENTO ]

### Pré-requisitos
- **Bun** ≥ 1.4 (`curl -fsSL https://bun.sh/install | bash`)
- **Terminal UTF-8** (recomendado Ghostty, WezTerm, Kitty ou Alacritty com Nerd Font)
- *(Opcional)* `poppler-utils` (`pdftoppm`, `pdfinfo`) para visualização gráfica de PDFs

### Executando pelo Código-Fonte
```sh
git clone https://github.com/raillen/daisy-file-manager.git
cd daisy-file-manager
bun install
bun run dev
```

### Comandos de Verificação
```sh
bun run dev        # Inicia a TUI interativa
bun run build      # Compila executáveis nativos standalone em dist/
bun test           # Executa a suíte de testes automatizados (113 testes)
bun run typecheck  # Checagem estrita de tipos com TypeScript (tsc --noEmit)
bun run lint       # Análise estática e formatação de código com Biome
bun run verify     # Executa test + typecheck + lint em sequência
```

---

## ⛁ [ 06 // ARQUITETURA DO PROJETO ]

```text
daisy-file-manager/
├── design/              # Fonte canônica de design tokens (colors.json, icons.json, i18n/*.json)
├── src/
│   ├── app/             # Componentes OpenTUI + Solid (camada de apresentação fina)
│   │   ├── dialogs/     # Diálogos modais com focus trap (PDF, Imagem, Texto, Temas, etc.)
│   │   ├── entries/     # Renderização de itens em lista e grade
│   │   ├── layout/      # Estrutura de janelas, cabeçalho, barra lateral e rodapé
│   │   └── App.tsx      # Componente raiz da aplicação
│   ├── commands/        # Registro de comandos semânticos e mapa de teclas (@opentui/keymap)
│   ├── core/            # Módulos puros e testáveis (fs, pdf, preview, drives, etc.)
│   ├── state/           # Stores reativas Solid (session, ui, operations)
│   └── main.tsx         # Ponto de entrada e bootstrap da TUI
├── packaging/           # Scripts de release (Arch, Fedora, Debian, AppImage, Flatpak)
├── tests/               # Suíte abrangente de testes automatizados com bun:test
└── install.sh           # Instalador inteligente one-line
```

---

## ◬ [ 07 // ROADMAP DE VERSÕES ]

Para consultar as próximas versões planejadas (Player de Áudio Embutido `player.exe`, Comparador de Diff, Busca Global com Ripgrep e Integração com Git), veja:

👉 **[ROADMAP.md](ROADMAP.md)**

---

## ⚖ [ 08 // LICENÇA ]

Este projeto está licenciado sob os termos da licença **[MIT](LICENSE)**.
