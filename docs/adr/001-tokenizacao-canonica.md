# ADR 001 — Tokenização canônica compartilhada entre TUI e website

**Status:** Aceito
**Data:** 2026-10-12

## Contexto

O daisy-file-manager tem duas superfícies com necesidades de design: a TUI (OpenTUI/Solid, terminal truecolor) e o website de documentação (HTML/CSS, em `website/`). Ambas precisam de:

- cores por tema (claro/escuro, com temas futuros);
- ícones consistentes;
- textos traduzíveis (pt-BR canônico, en-US inicial).

Sem uma fonte única, temas e traduções divergem entre TUI e site.

## Decisão

`design/` na raiz é a **fonte única de verdade**:

- `design/tokens/colors.json` — tokens semânticos (`bg.default`, `fg.accent`, …) com valor por tema;
- `design/tokens/icons.json` — nome semântico → `phosphor` (site), `unicode` (fallback), `nerd` (codepoint Nerd Font quando confiável), `color` (token semântico);
- `design/tokens/metrics.json` — espaçamento, tipografia, raio;
- `design/i18n/{pt-BR,en-US}.json` — dicionários espelhados.

Consumidores:

- **TUI** (`src/core/theme`, `src/core/i18n`) importa os JSONs via `import ... with { type: "json" }`; o Bun os embute no binário compilado;
- **Website** (`website/`) busca os mesmos JSONs por `fetch` e gera CSS custom properties.

Adicionar um tema = um novo conjunto de valores em `colors.json` (e, no site, um arquivo CSS derivado). Adicionar um idioma = um novo `design/i18n/<locale>.json`. Nenhum consumidor muda.

## Invariantes

1. Nenhum literal de cor, ícone ou texto de interface em componentes. Cores só via token semântico; texto só via `t("chave")`; ícones só via nome do registro.
2. Todo token de cor novo entra em **todos** os temas (garantido por teste de paridade).
3. Todo idioma novo mantém paridade de chaves com pt-BR (garantido por teste).
4. Glifo Nerd Font só entra no registro quando o codepoint é confiável; caso contrário, o fallback Unicode cobre.

## Alternativas rejeitadas

- **Duplicar tokens em TUI e site** — rejeitado: diverge na primeira mudança de tema.
- **Gerar CSS/TS a partir de um fonte único** — considerado; adotado o consumo direto dos JSONs para evitar etapa de geração no build do site (que é zero-build).
- **Só Nerd Font, sem fallback** — rejeitado: terminais sem Nerd Font renderizam tofu.