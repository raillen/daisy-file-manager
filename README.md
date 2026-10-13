# 🌼 Daisy File Manager

[![Bun](https://img.shields.io/badge/Bun-%E2%89%A51.4-black?style=flat-square&logo=bun)](https://bun.sh)
[![OpenTUI](https://img.shields.io/badge/UI-OpenTUI%20%2B%20Solid.js-blue?style=flat-square)](https://github.com/opentui)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Biome](https://img.shields.io/badge/Code%20Style-Biome-60A5FA?style=flat-square&logo=biome)](https://biomejs.dev)
[![Tests](https://img.shields.io/badge/Tests-109%20passing-success?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

Gerenciador de arquivos TUI elegante, ágil e acessível estilo Nautilus (GNOME Files), construído com **OpenTUI**, **Solid.js (1.9.12)** e **TypeScript** sobre o runtime **Bun**.

---

## ✨ Recursos Principais

### 📂 Interface & Navegação Estilo Nautilus
- **Modos de Exibição**: Alternância imediata entre lista detalhada e grade de ícones (`v`).
- **Painel Duplo (Split-Pane)**: Divisão de tela (`F3`) com sessões independentes e chaveamento instantâneo via `Tab`.
- **Barra Lateral Completa**:
  - **Locais do Sistema**: Home, Documentos, Downloads, Músicas, Imagens, Vídeos, Área de Trabalho, Raiz e Lixeira.
  - **Favoritos (Bookmarks)**: Fixe e desafixe qualquer pasta da barra lateral com um toque (`b`).
  - **Dispositivos & Discos**: Detecção dinâmica de HDs externos, pendrives USB e pontos de montagem via `lsblk`.
- **Caminho e Breadcrumbs**: Navegação de caminho com segmentos interativos no cabeçalho.
- **Barra de Status Rica**: Exibição em tempo real de itens na pasta, itens selecionados, permissões e espaço livre em disco.

### 🔍 Busca, Filtros & Modo de Comando
- **Filtro Fuzzy Instantâneo**: Ative a busca com `/` e filtre pastas em tempo real com realce de correspondências.
- **Linha de Comando Estilo Vim (:ex)**: Pressione `:` para executar comandos nativos como `:cd <pasta>`, `:mkdir <nome>`, `:touch <nome>`, `:sort <critério>`, `:theme <tema>` e `:quit`.

### 🖱️ Suporte Completo a Mouse & Menu Contextual
- **Menu de Contexto**: Abra com o **botão direito do mouse** ou pressionando `m` sobre qualquer arquivo ou pasta.
- Ações rápidas no menu: Abrir, Abrir com aplicativo personalizado, Copiar, Recortar, Renomear, Fixar/Desafixar favoritos, Enviar para a Lixeira e Propriedades.
- Navegação e seleção clicáveis em itens, abas e botões.

### 📄 Visualizador de PDF Embutido
- Renderização gráfica de páginas de PDF em alta resolução via `pdftoppm`.
- **Zoom Real Configurável**: Escalas de 50%, 75%, 100%, 125%, 150%, 175%, 200%, 250% e 300% com rolagem suave (`ScrollBox`).
- **Ajuste à Tela (Fit)**: Modo de enquadramento automático (`f` ou `0`) que calibra largura e altura para caber perfeitamente no terminal.
- Controles de zoom via atalhos de teclado (`Ctrl +`, `Ctrl -`, `+`, `-`), botões na barra de ferramentas ou `Ctrl + Scroll` do mouse.
- Navegação entre páginas (`n`, `p`, `Home`, `End`), modo de texto alternativo (`t`) e DPI dinâmico (72 a 300 DPI).

### 👁️ Visualizadores & Pré-visualização Integrados
- **Imagens**: Visualização em alta resolução no terminal através de protocolos gráficos suportados.
- **Texto e Código**: Janela de leitura com destaque sintático, quebra de linha e numeração.
- **Arquivos Compactados**: Extração automática de arquivos `.tar.gz` e `.zip` com um toque (`Enter` ou atalho de extração).
- **Painel Lateral de Prévia**: Exibição instantânea de metadados, conteúdo de texto, miniaturas de imagem e contagem de itens em diretórios.

### 📦 Operações de Arquivo Robustas
- **Área de Transferência**: Copiar (`y`), recortar (`d`) e colar (`p`) com suporte a seleção múltipla.
- **Diálogo Copiar/Mover Para**: Seleção interativa de pasta de destino com navegação (`F5` para copiar, `F6` para mover).
- **Fila de Tarefas em Segundo Plano**: Operações assíncronas com toast notification de progresso e cancelamento seguro.
- **Resolução de Conflitos**: Diálogo interativo para arquivos existentes (Sobrescrever, Renomear ou Pular).
- **Lixeira do Sistema**: Integração com `gio trash` para exclusão recuperável.

### 🎨 Design System, Temas & Acessibilidade
- **Seletor de Temas Interativo em Tempo Real**: Pressione `t` ou `F10` para abrir o menu `themes.exe` com visualização ao vivo imediata das cores enquanto você navega pelas opções com as setas (`↑`/`↓`), `j`/`k` ou teclas de atalho numéricas (`1` a `5`).
- **Paletas Semânticas Tokenizadas**:
  - `wired`: Estilo *The Wired / Serial Experiments Lain* em Azul Cobalto elétrico (`#00126b`) e Amarelo Ácido (`#ffe500`).
  - `cyberpunk`: Estilo neon futurista em Rosa Hot Magenta (`#ff2a85`) e Roxo Neon (`#9d4edd`).
  - `retro`: Estilo desktop clássico 1998 em Paper claro (`#f1eee9`) e Azul Cobalto (`#11379f`).
  - `dark`: Modo escuro padrão limpo e balanceado.
  - `light`: Modo claro limpo e de alto contraste.
- **Micro-HUDs Técnicos & Sinais**: Barra de sinal VU-Meter `▰▰▰▰▰▱▱▱`, leitor de status `WIRED_ONLINE // SYSTEM 98`, numeração técnica na barra lateral (`01 //`, `02 //`, `03 //`) e molduras de janela retro `[ _ ] [ □ ] [ × ]`.
- **Sistema de Ícones**: Suporte a Nerd Fonts com fallback automático para Unicode em qualquer terminal.
- **Internacionalização (i18n)**: Suporte completo e paritário em Português (`pt-BR`) e Inglês (`en-US`).
- **Acessibilidade**: Foco visível em todos os controles, contraste calibrado e navegação 100% acionável via teclado.

---

## 🚀 Instalação e Execução

### ⚡ Instalação Rápida (One-Line Installer)

Instale ou atualize o Daisy com um único comando no terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash
```

*(Ou usando `wget`: `wget -qO- https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash`)*

O instalador interativo oferece:
- **Escolha da versão**: Instala a versão estável mais recente (`v0.1.0`) ou permite escolher qualquer versão/tag do projeto.
- **Escolha do formato**:
  - **Binário Standalone** *(Recomendado)*: Instalação rápida em `~/.local/bin/daisy` sem necessidade de permissões root.
  - **Pacote Nativo**: Detecta automaticamente sua distro e instala via gerenciador nativo (`.pkg.tar.zst` no Arch, `.deb` no Debian/Ubuntu, `.rpm` no Fedora).
  - **AppImage**: Executável autocontido portátil.
  - **Flatpak Bundle**: Pacote de sandbox isolado.
- **Verificação criptográfica**: Valida a integridade do arquivo baixado via hash **SHA-256**.
- **Integração com Desktop**: Cria automaticamente o atalho `.desktop` e instala o ícone no seu lançador de aplicativos (GNOME, KDE, Rofi, etc.).

#### Instalação Não Interativa / Automação
```sh
# Instalar a versão recomendada diretamente sem perguntas
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --yes

# Escolher versão e formato via parâmetros
curl -fsSL https://raw.githubusercontent.com/raillen/daisy-file-manager/main/install.sh | bash -s -- --version v0.1.0 --format binary
```

---

### Pré-requisitos (para desenvolvimento ou compilação)
- **Bun** ≥ 1.4 (`curl -fsSL https://bun.sh/install | bash`)
- **Terminal com UTF-8** (recomendado emuladores modernos como Ghostty, WezTerm, Kitty ou Alacritty com Nerd Font)
- *(Opcional)* `poppler-utils` (`pdftoppm`, `pdfinfo`) para renderização visual de PDFs.

### Executando pelo Código-Fonte
```sh
# Clonar o repositório
git clone https://github.com/raillen/daisy-file-manager.git
cd daisy-file-manager

# Instalar dependências
bun install

# Iniciar o Daisy no diretório atual
bun run dev

# Ou passando um diretório inicial específico
bun run dev ~/Downloads
```

### Compilando Binário Standalone
O Daisy pode ser compilado em um binário nativo executável sem dependência do Bun instalado:
```sh
# Compilar binário standalone
bun run build

# Executar o binário compilado
./dist/daisy-linux-x64
```

---

## ⌨️ Tabela de Atalhos

| Categoria | Atalho | Ação |
| --- | --- | --- |
| **Navegação** | `j` / `↓` | Mover cursor para baixo |
| | `k` / `↑` | Mover cursor para cima |
| | `l` / `Enter` | Entrar na pasta / abrir visualizador de arquivo |
| | `h` | Voltar ao diretório pai |
| | `g` / `G` | Ir para o primeiro / último item |
| | `Tab` | Alternar entre o painel esquerdo e direito (Split-Pane) |
| | `v` | Alternar modo de exibição (Lista / Grade) |
| **Seleção** | `Espaço` | Marcar / desmarcar item sob o cursor |
| | `V` | Alternar modo visual de seleção por intervalo |
| | `Ctrl + A` | Selecionar todos os itens da pasta |
| | `Ctrl + D` | Desmarcar todos os itens |
| **Operações** | `y` | Copiar seleção para a área de transferência |
| | `d` | Recortar seleção para a área de transferência |
| | `p` | Colar itens da área de transferência |
| | `F5` / `Shift + C` | Abrir diálogo para copiar itens para outra pasta |
| | `F6` / `Shift + M` | Abrir diálogo para mover itens para outra pasta |
| | `a` / `F2` | Renomear item selecionado |
| | `Ctrl + N` | Criar nova pasta (`mkdir`) |
| | `Ctrl + Shift + N` | Criar novo arquivo vazio (`touch`) |
| | `D` / `Delete` | Enviar itens selecionados para a Lixeira |
| | `Shift + Delete` | Excluir itens permanentemente |
| | `o` | Abrir arquivo com o programa padrão do sistema (`xdg-open`) |
| | `b` | Fixar ou desafixar a pasta atual nos Favoritos da barra lateral |
| | `m` / `Menu` | Abrir Menu Contextual sob o cursor |
| | `i` / `Alt + Enter` | Exibir diálogo de Propriedades e metadados |
| **Busca & Comandos** | `/` | Iniciar busca com filtro fuzzy instantâneo |
| | `:` | Abrir linha de comando (`:cd`, `:mkdir`, `:sort`, `:theme`, etc.) |
| | `Esc` | Fechar busca, diálogo ou desmarcar seleção |
| **Leitor de PDF** | `+` / `Ctrl + =` | Aumentar zoom (+25%) |
| | `-` / `Ctrl + -` | Reduzir zoom (-25%) |
| | `f` / `Ctrl + 0` / `0` | Alternar ajuste à tela (Fit to screen) |
| | `j` / `↓` / `k` / `↑` | Rolar página do PDF quando ampliado |
| | `n` / `p` | Próxima / página anterior |
| | `t` | Alternar entre modo visual e texto extraído |
| **Interface** | `F9` | Mostrar / ocultar barra lateral |
| | `F3` | Alternar painel duplo (split-pane) |
| | `t` / `Shift + T` / `F10` | Abrir Seletor de Temas com preview em tempo real (`dark`, `wired`, `cyberpunk`, `retro`, `light`) |
| | `?` | Abrir painel de Ajuda e atalhos |
| | `q` / `Ctrl + C` | Sair do Daisy |

---

## ⚙️ Configuração Declarativa (`config.toml`)

Você pode personalizar o comportamento do Daisy criando um arquivo em `~/.config/daisy/config.toml` ou no próprio diretório do projeto em `.daisy/config.toml`:

```toml
[theme]
name = "dark"          # "dark" | "wired" | "cyberpunk" | "retro" | "light"
icons = "nerd"         # "nerd" (ícones Nerd Font) ou "unicode"

[locale]
lang = "pt-BR"         # "pt-BR" ou "en-US"

[editor]
command = "code"       # Editor para abrir arquivos de texto (ex: "nvim", "nano", "code")

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

## 🛠️ Scripts & Desenvolvimento

```sh
bun run dev        # Inicia a TUI em modo interativo
bun run build      # Compila executáveis nativos standalone em dist/
bun test           # Executa a suíte de testes (109 testes unitários e de integração)
bun run typecheck  # Checagem estrita de tipos com TypeScript (tsc --noEmit)
bun run lint       # Análise estática e formatação de código com Biome
bun run verify     # Executa test + typecheck + lint em sequência
bun run website    # Servidor local da documentação em http://localhost:3000
```

---

## 🏛️ Arquitetura do Projeto

O Daisy segue princípios estritos de Clean Code, separação de responsabilidades e código reativo:

```
daisy-file-manager/
├── design/              # Fonte canônica de design tokens (colors.json, icons.json, i18n/*.json)
├── src/
│   ├── app/             # Componentes OpenTUI + Solid (camada de apresentação fina)
│   │   ├── dialogs/     # Diálogos modais (PDF, Imagem, Texto, Propriedades, Copiar/Mover)
│   │   ├── entries/     # Renderização de itens em lista e grade
│   │   ├── layout/      # Estrutura de janelas, cabeçalho, barra lateral e rodapé
│   │   └── App.tsx      # Componente raiz da aplicação
│   ├── commands/        # Registro de comandos semânticos e mapa de teclas (@opentui/keymap)
│   ├── core/            # Módulos de domínio puros e testáveis (fs, pdf, preview, drives, etc.)
│   ├── state/           # Stores reativas Solid (session, ui, operations)
│   └── index.tsx        # Ponto de entrada e bootstrap da TUI
├── website/             # Site estático de documentação interativa
└── tests/               # Suíte abrangente de testes automatizados com bun:test
```

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
