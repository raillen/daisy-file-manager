# Fases de implementação

O daisy é entregue em ordem: primeiro anda, depois decora, depois opera.

## F0 — Scaffold

Ferramenta, tipos, lint, teste de fumaça com `testRender`. Prova que OpenTUI + Solid 1.9.12 rodam sobre Bun.

**Estado:** concluído.

## F1 — Shell

Layout de quatro regiões (barra de títulos, barra de locais, lista, barra de status), keymap com camadas, navegação real em disco, breadcrumb, contador de itens.

**Estado:** concluído.

## F2 — Navegação rica

Store de entradas com ordenação, arquivos ocultos, ícones e cores, alternância lista/grade, multi-seleção, filtro fuzzy.

**Estado:** concluído.

## F3 — Pré-visualização

Registro de pré-visualizadores: imagem via `<image>` (Kitty/Sixel/blocos), código com realce via `<code>`, resumo de pasta, listagem de compactado, metadados. Cache com pré-carregamento do vizinho.

**Estado:** concluído.

## F4 — Operações

Nova pasta, novo arquivo, renomear inline e em lote, copiar/mover com fila de progresso e cancelamento, lixeira com confirmação, abrir com o programa padrão, watcher com `chokidar`, notificação ao concluir.

**Estado:** concluído.

## F5 — Acabamento

Abas, marcadores, painel duplo (`F3`), ex-comandos (`:cd`, `:mkdir`, `:mv`…), paleta de comandos, tela de ajuda, `config.toml`, temas, diálogos de propriedade e de conflito.

**Estado:** concluído.

## F6 — Entrega

Binário único com `bun build --compile` para glibc e musl, README, integração contínua.

**Estado:** concluído.

## F7+ — Depois

Busca global indexada, badges de git, miniatura de vídeo via ffmpeg, servir o app sobre SSH com `@opentui/ssh`.

**Estado:** planejado. Fora do escopo inicial por decisão: núcleo estável primeiro.