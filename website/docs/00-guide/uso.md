# Uso no dia a dia

## Navegação

O daisy funciona sem mouse. O painel central tem o foco por padrão.

| Ação | Tecla |
| --- | --- |
| Descer / subir | `j` / `k` ou setas |
| Entrar na pasta / abrir arquivo | `enter` ou `l` |
| Voltar ao pai | `h` |
| Primeiro / último item | `g` / `G` |
| Pular para início / fim | `ctrl+Home` / `ctrl+End` |

Também funciona com mouse: clique define o foco, roda do scroll navega, duplo clique abre.

## Seleção

| Ação | Tecla |
| --- | --- |
| Marcar item | `espaço` |
| Seleção em bloco (visual) | `V` |
| Marcar todos | `ctrl+a` |
| Desmarcar tudo | `ctrl+d` |

Itens marcados aparecem esmaecidos na lista e entram nas operações em lote.

## Busca

| Ação | Tecla |
| --- | --- |
| Filtrar a pasta atual | `/` |
| Busca recursiva dentro das subpastas | `f` |
| Limpar filtro | `esc` |

O filtro é fuzzy: `cfgs` encontra `config.json` e `settings.config.ts`.

## Arquivos

| Ação | Tecla |
| --- | --- |
| Copiar | `y` |
| Cortar | `d` |
| Colar | `p` |
| Renomear (inline) | `a` |
| Renomear em lote | `A` |
| Nova pasta | `ctrl+n` |
| Mover para a Lixeira | `D` |
| Propriedades | `i` |
| Abrir com o programa padrão | `o` |

Operações longas entram em uma fila com progresso e podem ser canceladas.

## Pré-visualização

O painel à direita acompanha a seleção. Ele mostra imagem, código com realce de sintaxe, resumo de pasta, listagem de arquivo compactado ou metadados.

`i` abre a pré-visualização em tela cheia; `F3` liga o painel duplo para mover itens entre duas pastas sem sair do app.