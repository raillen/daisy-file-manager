# design — fonte única de tokens

Este diretório é a **fonte única de verdade** de cores, ícones, métricas e textos.
Nada aqui é específico de TUI ou de website.

```
design/
  tokens/
    colors.json    tokens semânticos de cor, com valor por tema (light/dark)
    icons.json     nome semântico -> phosphor (site) / unicode (fallback) / nerd (TUI) / color
    metrics.json   espaçamento, tipografia, raio, layout
  i18n/
    pt-BR.json     dicionário canônico
    en-US.json     espelho em inglês
```

## Consumidores

- **TUI** — `src/core/theme/*` e `src/core/i18n/*` importam os JSONs (o Bun embute no binário).
- **Website** — `website/` busca os mesmos arquivos e deriva CSS custom properties.

## Regras

1. Componente nunca escreve cor, ícone ou texto literal.
2. Cor nova entra em **todos** os temas (teste de paridade em `tests/palette.test.ts`).
3. Idioma novo mantém paridade de chaves com pt-BR (teste em `tests/i18n-parity.test.ts`).
4. Glifo Nerd Font só entra no registro com codepoint confiável; senão o fallback Unicode cobre.

Ver `docs/adr/001-tokenizacao-canonica.md`.