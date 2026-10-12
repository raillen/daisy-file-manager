# Organização de pastas

## Visão geral

```text
daisy-file-manager/
├── index.tsx                 entrada: monta a Solid root no renderer
├── src/
│   ├── app/                   componentes finos de interface
│   │   ├── App.tsx
│   │   ├── AppShell.tsx       layout de 4 regiões
│   │   ├── TitleBar.tsx       breadcrumb, abas, busca
│   │   ├── Sidebar.tsx        lugares, marcadores, volumes
│   │   ├── FileList.tsx       visão em lista
│   │   ├── FileGrid.tsx       visão em grade
│   │   ├── PreviewPane.tsx    painel de pré-visualização
│   │   ├── StatusBar.tsx      contadores, seleção, espaço livre
│   │   └── dialogs/           confirmar, propriedades, progresso
│   ├── commands/              registro de comandos e camadas do keymap
│   ├── core/                  regras puras e testáveis
│   │   ├── entries/           leitura de diretório, ordenação, tipos
│   │   ├── operations/        copy, move, rename, trash, mkdir
│   │   ├── preview/           registro de pré-visualizadores
│   │   ├── theme/             paleta, ícones, métricas
│   │   └── i18n/              dicionários e tradutor
│   └── state/                 stores Solid
├── design/                    tokens canônicos (fonte única)
├── docs/adr/                  decisões de arquitetura
├── website/                   este site
├── .agents/workforce/         agentes e skills versionados
└── scripts/                   sync do workforce, servidor do site
```

## Regras de fronteira

| De → Para | Permitido |
| --- | --- |
| `app/` → `state/` | sim |
| `app/` → `commands/` | apenas `dispatch` |
| `state/` → `core/` | sim |
| `core/` → `app/` | nunca |
| `core/` → `state/` | nunca |

O `core` não importa Solid. Isso permite testar as regras com `bun test` sem renderer.

## Nomes

- Arquivos e diretórios em `snake_case`.
- Funções descrevem o verbo e o alvo: `readDirectory`, `moveToTrash`, `resolveIcon`.
- Sem abreviação: `config` e não `cfg`; `directory` e não `dir` dentro de nomes de função.