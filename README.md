# 🌼 Daisy File Manager

Gerenciador de arquivos TUI elegante e acessível estilo Nautilus (GNOME Files), construído com **OpenTUI**, **Solid.js** e **TypeScript** sobre **Bun**.

---

## ✨ Recursos

- 📂 **Navegação visual fluida**: Alternância imediata entre visualização em lista detalhada e grade de ícones (`v`).
- ⚡ **Atalhos intuitivos e ergonômicos**: Navegação estilo Vim (`hjkl`) ou setas, seleção individual com `Espaço` e seleção em bloco visual com `V`.
- 🔍 **Busca instantânea**: Filtro fuzzy veloz ativado com `/`, com realce automático e descarte com `Esc`.
- 👁️ **Painel de pré-visualização integrado**:
  - Imagens via protocolos de terminal compatíveis;
  - Arquivos de texto e código com detecção de linguagem;
  - Resumo de pastas (contagem de itens e subpastas);
  - Metadados detalhados de arquivos e binários com cache por caminho e mtime.
- 📦 **Operações de arquivos completas**:
  - Copiar (`y`), cortar (`d`), colar (`p`);
  - Nova pasta (`ctrl+n`), renomear (`a`);
  - Envio seguro para a lixeira via `gio trash` (`D`);
  - Abertura com o programa padrão do sistema via `xdg-open` (`o`);
  - Fila de tarefas assíncronas com indicador de progresso e cancelamento.
- 🔄 **Atualização em tempo real (Watcher)**: Monitoramento automático com `chokidar` que atualiza a listagem ao detectar alterações em disco.
- 🎨 **Design tokens e temas**:
  - Cores semânticas tokenizadas (`dark`, `light`, `nord`, `dracula`);
  - Ícones semânticos com suporte a Nerd Fonts e fallback elegante em Unicode;
  - Internacionalização nativa em português (`pt-BR`) e inglês (`en-US`).
- ⚙️ **Configuração declarativa em TOML**: Personalização de tema, idioma, atalhos e limites em `~/.config/daisy/config.toml` ou `.daisy/config.toml`.
- 🚀 **Binários nativos standalone**: Compilação via `bun build --compile` gerando executáveis únicos sem dependência do runtime Bun para Linux x64 (glibc e musl).
- 📖 **Site de documentação local**: Site completo de arquitetura, guias e referências em `website/`, com servidor integrado.

---

## 🚀 Instalação e Execução

### Requisitos

- **Bun** ≥ 1.4
- **Terminal com suporte UTF-8** (recomendado Nerd Font para ícones completos)

### Rodando pelo código-fonte

```sh
# Instalar dependências
bun install

# Iniciar o gerenciador no diretório atual
bun run dev

# Ou passando um caminho específico
bun run dev /caminho/do/diretorio
```

### Compilando binários nativos

```sh
# Compila para Linux x64 (glibc e musl)
bun run build

# Executar o binário gerado
./dist/daisy-linux-x64
```

---

## ⌨️ Tabela de Atalhos

| Categoria | Tecla | Ação |
| --- | --- | --- |
| **Navegação** | `j` / `↓` | Mover cursor para baixo |
| | `k` / `↑` | Mover cursor para cima |
| | `l` / `Enter` | Entrar na pasta / abrir arquivo |
| | `h` | Voltar ao diretório pai |
| | `g` / `G` | Ir para o primeiro / último item |
| | `v` | Alternar entre visualização em lista e grade |
| **Seleção** | `Espaço` | Marcar / desmarcar item sob o cursor |
| | `V` | Alternar modo visual de seleção |
| | `ctrl+a` | Marcar todos os itens |
| | `ctrl+d` | Desmarcar todos os itens |
| **Busca** | `/` | Iniciar busca com filtro fuzzy |
| | `Esc` | Fechar busca / desmarcar seleção / voltar ao normal |
| **Operações** | `y` | Copiar itens selecionados |
| | `d` | Cortar itens selecionados |
| | `p` | Colar itens da área de transferência |
| | `a` | Renomear item |
| | `ctrl+n` | Criar nova pasta |
| | `D` | Enviar itens selecionados para a lixeira |
| | `o` | Abrir item com o aplicativo padrão (`xdg-open`) |
| | `i` | Exibir diálogo de propriedades |
| **Interface** | `F9` | Alternar visibilidade da barra lateral |
| | `F3` | Alternar painel duplo (split-pane) |
| | `F10` | Alternar tema visual |
| | `?` | Abrir tela de ajuda e atalhos |
| | `q` / `ctrl+c` | Sair do daisy |

---

## ⚙️ Configuração (TOML)

Crie ou edite `~/.config/daisy/config.toml` ou `.daisy/config.toml`:

```toml
[theme]
name = "dark"          # "dark", "light", "nord", "dracula"
icons = "nerd"         # "nerd" ou "unicode"

[locale]
lang = "pt-BR"         # "pt-BR" ou "en-US"

[view]
default = "list"       # "list" ou "grid"
show_hidden = false
split_pane = false

[preview]
max_text_bytes = 1048576  # 1 MB

[keymap]
"ui.quit" = ["q", "ctrl+q"]
"view.toggleHidden" = ["H"]
```

---

## 🛠️ Scripts do Projeto

```sh
bun run dev        # Inicia a TUI em modo de desenvolvimento
bun run build      # Compila executáveis standalone em dist/
bun test           # Executa a suite de testes unitários e de integração
bun run typecheck  # Checagem estrita de tipos com tsc
bun run lint       # Validação de código e formatação com Biome
bun run verify     # Executa testes, typecheck e linter em sequência
bun run website    # Inicia o servidor local do site de documentação
bun run workforce  # Sincroniza agentes e skills do Prumo Workforce
```

---

## 📚 Documentação e Arquitetura

O projeto possui um site de documentação interativo completo contido na pasta `website/`. Para visualizá-lo:

```sh
bun run website
# Acesse http://localhost:3000 no seu navegador
```

### Estrutura de Código

```
daisy-file-manager/
├── design/              # Fonte canônica de design tokens (cores, ícones, i18n)
├── src/
│   ├── app/             # Componentes de interface OpenTUI + Solid (camada fina)
│   ├── commands/        # Definições semânticas de comandos e keymaps
│   ├── core/            # Módulos de domínio puros e testáveis (fs, config, preview, etc.)
│   ├── state/           # Stores reativas Solid (sessão, ui, operações)
│   └── main.tsx         # Bootstrap, inicialização de stores e ciclo de vida
├── website/             # Site de documentação estático inspirado no petunia3d
├── tests/               # 74 testes com bun:test e renderizadores headless do OpenTUI
├── .agents/workforce/   # Catálogo integrado de 40 agentes e 189 skills
└── build.ts             # Script de compilação multi-alvo para binários nativos
```

---

## 📄 Licença

MIT
