# Configuração

A personalização do daisy vive em **TOML**, não em JSON. Escolha deliberada: TOML é legível por pessoa, tolera comentário e separa blocos com nome — exatamente o formato de um arquivo escrito à mão.

## Onde fica

| Caminho | Precedência |
| --- | --- |
| padrão interno | menor |
| `~/.config/daisy/config.toml` | média |
| `./.daisy/config.toml` (no projeto) | maior |

O projeto local vence o global: dá para trocar tema e atalhos por repositório sem afetar o resto da máquina.

## Arquivo completo

```toml
theme = "dark"          # "light" | "dark"
locale = "pt-BR"        # "pt-BR" | "en-US"
iconSet = "nerd"        # "nerd" | "unicode"
editor = "nvim"
defaultView = "list"    # "list" | "grid"
showHidden = false
sortBy = "name"         # "name" | "size" | "modified" | "kind"
sortDescending = false
splitPane = false

[colors]
"fg.accent" = "#bc8cff"

[bookmarks]
paths = ["~/Projetos", "~/Notas"]

[keymap]
"nav.up" = ["k", "up"]
"file.trash" = ["D", "shift+d"]

[preview]
enabled = true
protocol = "auto"       # "auto" | "kitty" | "sixel" | "blocks"
maxTextBytes = 262144
```

Um exemplo pronto está no repositório, em `.daisy/config.toml.example`.

## Comportamento na hora de errar

Configuração inválida **não** derruba o aplicativo. O parser ignora o campo problemático, mantém o padrão e registra um aviso:

```text
~/.config/daisy/config.toml: config.theme: valor inválido "rosa" (esperado light | dark)
```

Isso vale para TOML sintaticamente quebrado, tipo errado, cor fora de `#rrggbb`, lista onde era texto. Um erro de digitação não pode custar acesso aos seus arquivos.

## Cores

O bloco `[colors]` sobrescreve apenas os tokens que você nomeia. Os demais continuam vindo de `design/tokens/colors.json`. Nome de token aceito:

```toml
[colors]
"fg.accent" = "#bc8cff"
"bg.selectedRow" = "#bc8cff22"   # 8 dígitos = alfa
"border.focus" = "#8957e5"
```

## Atalhos

O bloco `[keymap]` mapeia **nome de comando** para teclas. Você nunca edita um evento de teclado — edita dado. A tela de ajuda e a paleta de comandos leem essa mesma tabela, então continuam coerentes.

```toml
[keymap]
"file.yank" = ["y", "ctrl+c"]
"nav.enter" = ["l", "enter", "right"]
```

Para remover um atalho, mapeie para lista vazia:

```toml
[keymap]
"file.open" = []
```