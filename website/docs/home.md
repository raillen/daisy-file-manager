# daisy

Gerenciador de arquivos para terminal com a sensação de um aplicativo gráfico.

O **daisy** traz a ergonomia de um gerenciador de arquivos de desktop — barra de lugares, lista com colunas, painel de pré-visualização, barra de status — para dentro do terminal, sem abrir mão de teclado, velocidade e composição com o shell.

## O que já existe

| Área | Estado |
| --- | --- |
| Tokens de design, temas e traduções | pronto |
| Workforce de agentes e skills | pronto |
| Site de documentação | pronto |
| Shell da TUI (navegação) | em construção |

O andamento completo está na página [Fases de implementação](04-roadmap/fases.md).

## Começar

```sh
bun install
bun run dev
```

## Três decisões que definem o projeto

1. **Tokens antes de pixels.** Nenhuma cor, ícone ou texto de interface existe literal no código. Tudo vem de `design/`. É o que permite trocar de tema e de idioma sem tocar em componente.
2. **Comandos nomeados.** Toda ação tem nome e atalho registrados no keymap. Isso habilita paleta de comandos, ajuda automática e ex-comandos no estilo `:mkdir`.
3. **Clean code sem exceção.** Lógica em `src/core`, componentes finos em `src/app`, testes para o comportamento, não para a implementação.

## Um tease da interface

```
┌ daisy ── /home/raillen/projetos ────────────────── [1]  🔍 / ─┐
│ Lugares      │  Nome                Tamanho   Modificado      │
│ ▸ Pessoal   │  ▸ api               12 KB     12/09 14:20      │
│ ▸ Documentos │  ▸ docs              48 KB     11/09 09:02      │
│   Marcadores │    main.ts            4 KB     hoje 08:41      │
│   Volumes    │  ▸ node_modules      1.2 GB    10/09 18:03      │
├───────────────┴───────────────────────────────────────────────┤
│ 214 itens · 1 selecionado · 48 GB livres                       │
└───────────────────────────────────────────────────────────────┘
```

Mais detalhes na [Visão geral da arquitetura](01-arquitetura/visao-geral.md).