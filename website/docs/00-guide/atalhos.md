# Atalhos

Todos os atalhos são registrados no keymap por nome de comando — não há tecla fixa espalhada pelo código. É isso que permite a paleta de comandos e a tela de ajuda mostrarem exatamente o que está ativo.

## Navegação

| Comando | Tecla | Ação |
| --- | --- | --- |
| `nav.up` | `k` | mover cursor para cima |
| `nav.down` | `j` | mover cursor para baixo |
| `nav.enter` | `l` | abrir item |
| `nav.parent` | `h` | ir para a pasta superior |
| `nav.first` | `g` | primeiro item |
| `nav.last` | `G` | último item |
| `nav.goHome` | `gh` | ir para a pasta pessoal |
| `nav.historyBack` | `[` | voltar no histórico |

## Seleção

| Comando | Tecla | Ação |
| --- | --- | --- |
| `select.toggle` | `espaço` | marcar / desmarcar |
| `select.visual` | `V` | modo visual |
| `select.all` | `ctrl+a` | marcar tudo |
| `select.none` | `ctrl+d` | desmarcar tudo |

## Arquivos

| Comando | Tecla | ação |
| --- | --- | --- |
| `file.yank` | `y` | copiar |
| `file.cut` | `d` | cortar |
| `file.paste` | `p` | colar |
| `file.rename` | `a` | renomear |
| `file.renameBulk` | `A` | renomear em lote |
| `file.trash` | `D` | mover para a Lixeira |
| `file.mkdir` | `ctrl+n` | nova pasta |
| `file.open` | `o` | abrir com o programa padrão |
| `file.properties` | `i` | propriedades |

## Visualização

| Comando | Tecla | Ação |
| --- | --- | --- |
| `view.toggle` | `v` | alternar lista / grade |
| `view.hidden` | `ctrl+h` | mostrar / ocultar ocultos |
| `view.previewFull` | `i` | pré-visualização em tela cheia |
| `view.splitPane` | `F3` | painel duplo |
| `view.help` | `?` | ajuda |

## Interface

| Comando | Tecla | Ação |
| --- | --- | --- |
| `ui.palette` | `ctrl+shift+p` | paleta de comandos |
| `ui.search` | `/` | filtro |
| `ui.find` | `f` | busca recursiva |
| `ui.commandLine` | `:` | linha de comando |
| `ui.quit` | `q` | sair |

## Linha de comando

Aceita os mesmos comandos com notação curta:

```
:cd /tmp
:mkdir novo
:touch notas.txt
:cp origem destino
:mv origem destino
:rm arquivo
```

Digite `:` seguido de espaço para listar os comandos disponíveis.