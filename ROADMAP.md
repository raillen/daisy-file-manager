# 🗺️ ROADMAP — Daisy File Manager

Planejamento estratégico de evolução do **Daisy**, o gerenciador de arquivos TUI estilo Nautilus com visual inspirado em *The Wired (Serial Experiments Lain)* e arquitetura moderna sobre **Bun**, **SolidJS** e **OpenTUI**.

---

## 📌 Visão Geral de Versões

| Versão | Foco Principal | Status |
| :--- | :--- | :--- |
| **v0.1.0** | Fundação Estável, Navegação Nautilus, Visualizadores & Design System | ✅ Concluído |
| **v0.2.0** | Multimídia, Player de Áudio, Comparador de Diff & Ações Externas | 🚀 Próxima |
| **v0.3.0** | Busca Global Profunda, Ripgrep & Integração com Git | 📋 Planejado |
| **v0.4.0** | Renomeação em Lote, Terminal Drawer & Volumes Remotos | 📋 Planejado |
| **v1.0.0** | Sistema de Plugins, Paleta de Comandos & Estabilidade de Longo Prazo | 🔮 Futuro |

---

## ✅ v0.1.0 — Fundação Estável & Core Nautilus (Atual)

- [x] **Navegação & Interface**:
  - [x] Modos de exibição em Lista detalhada e Grade de ícones (`v`).
  - [x] Modo Split-Pane duplo com sessões independentes e chaveamento via `Tab` (`F3`).
  - [x] Barra lateral completa com Lugares do Sistema (Home, Documentos, Downloads, Músicas, Imagens, Vídeos, etc.).
  - [x] Sistema dinâmico de Favoritos (Bookmarks) com atalho de fixar/desafixar (`b`).
  - [x] Detecção dinâmica de hardware: HDs externos, pendrives USB e volumes montados via `lsblk` com ejeção segura (`udisksctl`).
  - [x] Caminho navegável com breadcrumbs interativos no cabeçalho.
- [x] **Operações de Arquivo**:
  - [x] Área de transferência completa: Copiar (`y`), Recortar (`d`) e Colar (`p`) com suporte a seleção múltipla.
  - [x] Diálogo interativo para Copiar/Mover para pasta de destino (`F5` / `F6`).
  - [x] Fila de operações assíncronas em segundo plano com notificações toast de progresso e cancelamento.
  - [x] Diálogo de resolução de conflitos (Sobrescrever, Renomear, Pular).
  - [x] Envio seguro para a Lixeira do sistema (`gio trash`).
- [x] **Visualizadores Embutidos**:
  - [x] Leitor gráfico de PDF em alta resolução via `pdftoppm` com zoom real (50% a 300%), ajuste à tela (`Fit`), DPI dinâmico e modo de texto.
  - [x] Visualizador de Imagens em tela cheia com detecção de protocolos gráficos.
  - [x] Visualizador de Texto e Código com destaque sintático e quebra de linha.
  - [x] Renderização de **Markdown em Rich Text** (`<markdown>`) com cabeçalhos, listas, blockquotes, tabelas e código.
  - [x] Descompactação automática de arquivos compactados (`.tar.gz`, `.zip`).
  - [x] Painel lateral de pré-visualização instantânea com metadados e contagem de itens.
- [x] **Interação, Menus & Foco**:
  - [x] Menu Contextual completo disparado por clique do **botão direito do mouse** ou atalho de teclado (`m`).
  - [x] **Focus Trap Total**: isolamento de teclado e mouse com backdrops em tela cheia para todos os modais e diálogos sobrepostos.
  - [x] Linha de comandos estilo Vim (`:ex`) com `:cd`, `:mkdir`, `:touch`, `:sort`, `:theme` e `:quit`.
  - [x] Filtro de busca fuzzy instantâneo (`/`).
  - [x] Diálogo de propriedades e metadados detalhados (`i` / `Alt + Enter`).
- [x] **Design System, Temas & Acessibilidade**:
  - [x] 5 temas canônicos tokenizados: `dark`, `wired` (Lain), `cyberpunk`, `retro` (1998) e `light`.
  - [x] Seletor de temas interativo com **Live Preview ao vivo em tempo real** (`t` / `F10` / `themes.exe`).
  - [x] Micro-HUDs técnicos: VU-meter, status de sinal e molduras retro.
  - [x] Paridade total de internacionalização (Português `pt-BR` e Inglês `en-US`).
- [x] **Distribuição & DevOps**:
  - [x] Compilação em binários nativos standalone (`glibc` e `musl`).
  - [x] Pacotes oficiais para Arch Linux (`PKGBUILD`), Fedora (`.rpm`), Debian/Ubuntu (`.deb`), AppImage e Flatpak.
  - [x] Script instalador interativo em uma única linha (`install.sh`).
  - [x] Suíte de testes com 113 testes automatizados, TypeScript strict e Biome linter.

---

## 🚀 v0.2.0 — Multimídia, Player de Áudio & Produtividade Visual

- [ ] **Player de Áudio Retro-Cyberpunk (`player.exe`)**:
  - [ ] Reprodução de arquivos de áudio (`.mp3`, `.flac`, `.wav`, `.ogg`, `.m4a`) diretamente no Daisy.
  - [ ] Execução assíncrona em segundo plano utilizando backends de sistema (`mpv --no-video` ou `ffplay -nodisp`).
  - [ ] Interface modal estilo *Winamp / Cyber HUD*:
    - [ ] Barra de progresso visual com scrubber de tempo decorrido e duração total (`01:45 / 03:30`).
    - [ ] VU-Meter e analisador de espectro estético animado em caracteres ASCII/Unicode (`▰▰▰▰▱▱`).
    - [ ] Controles multimídia completos: Play/Pause (<kbd>Espaço</kbd>), Avançar/Retroceder (<kbd>→</kbd>/<kbd>←</kbd>), Ajuste de Volume (<kbd>↑</kbd>/<kbd>↓</kbd>), Repetir e Aleatório.
    - [ ] Playlist contínua automática: avança para a próxima faixa da pasta ao término da música atual.
    - [ ] Mini-player minimizado na barra de status permitindo navegar enquanto ouve música.
- [ ] **Comparador Visual de Arquivos (`daisy-diff`)**:
  - [ ] Integração com o componente intrínseco `<diff>` do OpenTUI.
  - [ ] Seleção de 2 arquivos de texto/código e abertura de comparação via atalho ou menu de contexto.
  - [ ] Modos de visualização: Lado a lado (*Side-by-Side*) e Unificado (*Unified Diff*).
  - [ ] Realce sintático de adições em verde e remoções em vermelho com rolagem sincronizada.
- [ ] **Ações Externas & Abrir Com no Topo dos Modais**:
  - [ ] Botão visual dedicado na barra superior de todos os visualizadores de arquivo (`Abrir no App Externo`).
  - [ ] Suporte a seleção rápida de aplicativo externo configurado no `config.toml` ou fallback para `xdg-open`.
- [ ] **Miniaturas de Vídeo no Painel de Pré-visualização**:
  - [ ] Integração com `ffmpegthumbnailer` para gerar automaticamente miniaturas de frames de arquivos de vídeo (`.mp4`, `.mkv`, `.webm`, `.avi`).
  - [ ] Exibição da miniatura gráfica no painel lateral de prévia com metadados de resolução, duração e codec.

---

## 📋 v0.3.0 — Busca Global Profunda & Controle de Versão (Git)

- [ ] **Busca Global Recursiva (<kbd>Ctrl + P</kbd>)**:
  - [ ] Diálogo estilo *Fuzzy Finder / Telescope* para encontrar qualquer arquivo em subpastas profundas instantaneamente.
  - [ ] Integração nativa com `fd` (se disponível) ou rastreador assíncrono em árvore com cache de diretório.
- [ ] **Busca por Conteúdo nos Arquivos (<kbd>Ctrl + Shift + F</kbd> / `:grep`)**:
  - [ ] Localização de strings e expressões regulares dentro de arquivos de código e texto via `ripgrep` (`rg`).
  - [ ] Lista interativa de resultados com navegação para a linha exata do arquivo.
- [ ] **Integração Visual com Git**:
  - [ ] Exibição da branch atual e estado do repositório no cabeçalho superior (`git: main [clean]` ou `git: feat/audio [3 modified]`).
  - [ ] Badges coloridos na listagem de arquivos:
    - [ ] `M` (Amarelo) — Modificado
    - [ ] `?` (Cinza) — Não rastreado (*untracked*)
    - [ ] `A` ou `+` (Verde) — Adicionado à staging area (*staged*)
    - [ ] `D` (Vermelho) — Excluído
  - [ ] Comando rápido `:git status` e `:git diff` via menu de contexto.

---

## 📋 v0.4.0 — Automação, Operações Avançadas & Conectividade

- [ ] **Renomeação em Lote (Batch Rename)**:
  - [ ] Diálogo interativo para renomear múltiplos itens selecionados usando padrões e expressões regulares (ex: substituir prefixos, inserir contadores sequenciais `001, 002...`).
  - [ ] Modo de renomeação via editor de texto externo: abre os nomes selecionados no `$EDITOR` do usuário para renomeação rápida em massa estilo `vidir`.
- [ ] **Gaveta de Terminal Suspenso (<kbd>Ctrl + `</kbd> ou <kbd>Ctrl + O</kbd>)**:
  - [ ] Painel de terminal embutido que desliza da base da tela no diretório atualmente aberto.
  - [ ] Permite executar comandos rápidos do shell sem precisar sair ou suspender a sessão do Daisy.
- [ ] **Diálogo de Compactação e Empacotamento Personalizado**:
  - [ ] Selecionar itens e criar novos arquivos `.tar.gz`, `.tar.zst`, `.zip` ou `.7z` escolhendo o nome e nível de compressão.
- [ ] **Navegação de Volumes e Servidores Remotos**:
  - [ ] Suporte a montagens remotas do GVFS: SFTP, SSHFS, SMB/Samba, WebDAV e Google Drive.
  - [ ] Diálogo interativo `:connect sftp://usuario@servidor` com integração de montagem sob demanda.

---

## 🔮 v1.0.0 — Plataforma Extensível & Estabilidade de Longo Prazo

- [ ] **Sistema de Plugins e Scripts do Usuário**:
  - [ ] Criação de comandos e filtros personalizados através de scripts em JavaScript/TypeScript ou executáveis externos.
  - [ ] Hooks de evento (ao entrar em pasta, ao selecionar arquivo, antes de colar).
- [ ] **Paleta de Comandos Completa (<kbd>Ctrl + Shift + P</kbd>)**:
  - [ ] Acesso a todas as ações e configurações do aplicativo via pesquisa difusa de comandos.
- [ ] **Suporte Multiplataforma Expandido**:
  - [ ] Suporte oficial e testes contínuos para macOS e Windows (via WSL2 e Windows Terminal).
- [ ] **API de Configuração Estável**:
  - [ ] Congelamento de compatibilidade retrógrada para a sintaxe do `config.toml` e temas customizados de usuário.

---

## 💡 Princípios Orientadores (Design Invariants)

1. **Zero literal de design em componentes**: Todas as cores, ícones e textos devem ser baseados em tokens semânticos e dicionários i18n.
2. **Performance Instantânea**: Inicialização abaixo de 50ms e resposta de teclado em 0ms (60 FPS fluidos em renderização de terminal).
3. **Carga Cognitiva Baixa**: Interfaces claras, com legendas e atalhos visíveis em todos os momentos (*Cognitive Clarity*).
4. **Resiliência a Falhas**: Erros de permissão, sistemas de arquivos de rede ou arquivos corrompidos nunca devem congelar ou encerrar a aplicação.
