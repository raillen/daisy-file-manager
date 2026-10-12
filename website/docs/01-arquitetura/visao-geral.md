# Visão geral

## Camadas

```
┌─────────────────────────────────────────────────────────────┐
│ interface        Solid + JSX, componentes finos             │
├─────────────────────────────────────────────────────────────┤
│ comandos         keymap: camadas, sequências, nomes         │
├─────────────────────────────────────────────────────────────┤
│ estado           stores Solid (session, ui, clipboard)      │
├─────────────────────────────────────────────────────────────┤
│ core             fs, operações, preview, ícones, config     │
└─────────────────────────────────────────────────────────────┘
```

Nenhuma regra de negócio vive no componente. O componente recebe estado e despacha comando; o serviço decide.

## Por que keymap e não `if (key === "x")`

Comandos nomeados resolvem quatro problemas de uma vez:

1. **Ajuda automática** — a tela de ajuda lê os comandos registrados e suas teclas ativas.
2. **Paleta de comandos** — o mesmo catálogo alimenta o `ctrl+shift+p`.
3. **Camadas** — `V` (visual), `/` (busca) e diálogos têm seus próprios atalhos sem colisão com o modo normal.
4. **Remapeamento** — trocar `D` por `x` é mudar dado, não código.

## Modelo de dados

```text
Entry          um item do diretório: nome, caminho, tamanho, mtime,
               permissões, tipo, se é link, alvo do link
SessionState   diretório atual, entradas, cursor, seleção, ordem
UiState        modo, diálogo ativo, visão (lista|grade), filtros
ClipboardState origem e destino das operações copy/cut
```

Stores Solid isolam o que muda com frequência (cursor, seleção) do que muda pouco (config).

## Fluxo de uma operação

```text
tecla → keymap resolve comando → comando pede ao serviço →
serviço executa com AbortSignal → publica progresso no store →
componente reage ao store
```

A UI nunca bloqueia: operações longas reportam progresso e podem ser canceladas.

## Decisões registradas

- [ADR 001 — Tokenização canônica](../adr/001-tokenizacao-canonica.md) no repositório: por que cores, ícones e textos vivem em `design/`.
- OpenTUI `0.6.1` e Solid `1.9.12` fixados por versão: o binding do Solid exige versão exata.