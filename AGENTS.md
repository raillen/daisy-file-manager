# AGENTS.md — daisy-file-manager

Gerenciador de arquivos TUI estilo Nautilus, construído com OpenTUI + Solid + TypeScript sobre Bun.

## Stack (não negociar)

- **Runtime**: Bun ≥ 1.4 (`bun run`, `bun test`, `bun build --compile`). Node não é caminho suportado pelo OpenTUI aqui.
- **UI**: `@opentui/solid` com `solid-js` **1.9.12 exato**. Componentes intrínsecos em `snake_case`.
- **Comandos**: `@opentui/keymap` (camadas, sequências, ex-commands). Nenhum handler de tecla avulso.
- **Testes**: `bun test` + `testRender`/`createTestRenderer` do próprio OpenTUI.
- **Qualidade**: `biome check` + `tsc --noEmit` (strict, `noUncheckedIndexedAccess`).

## Invariantes de design (não quebrar)

1. **Zero literal de design em componente.** Cor só via token semântico de `design/tokens/colors.json`; ícone só via nome de `design/tokens/icons.json`; texto só via `t("chave")` de `design/i18n/*.json`.
2. **Temas e idiomas são dados.** Novo tema = novo valor em `colors.json`; novo idioma = novo `design/i18n/<locale>.json` com paridade de chaves com pt-BR.
3. **Acessibilidade é requisito**, não extra: teclado sempre disponível, foco visível, texto selecionável, contraste verificado.
4. **Carga cognitiva baixa** em UI e documentação: uma decisão por vez, rótulos literais, hints de atalho visíveis (regra do skill `cognitive-clarity`).

## Clean code (não negociar)

- Funções pequenas, uma responsabilidade por módulo, nomes semânticos explícitos.
- Lógica em `src/core/*` (puro, testável); componentes em `src/app/*` são finos.
- Comandos são nomeados e registrados no keymap; nada de `if (key === "x")` espalhado.
- Sem `any`, sem assertion não-null, sem magic string duplicado — tipo ou token sempre.
- Comentários: só quando o *porquê* não é óbvio pelo nome. Não narrar o *o quê*.

## Workforce (obrigatório por tipo de tarefa)

Antes de qualquer trabalho, consulte o agent/skill adequado em `.agents/workforce`:

| Tipo de trabalho | Usar |
| --- | --- |
|(tokens, cores, ícones, temas, traduções | `design-system-engineer`, skills `design-tokens`, `icon-system`, `typography-system`, `color-science` |
| Interface, layout, fluxo, copy | `ux-architect`, `ui-component-engineer`, `design-researcher`, skills `wireframing`, `interaction-design`, `user-flows` |
| Acessibilidade | `accessibility-reviewer`, skills `accessibility`, `contrast`, `keyboard-accessibility`, `focus-management`, `screen-reader`, `zoom-reflow` |
| Comunicação/documentação | skill `cognitive-clarity` |
| Implementação/revisão técnica | `implementer`, `reviewer`, `quality-reviewer`, `tester`, skills `clean-code`, `code-quality`, `architecture-quality`, `testing-quality` |

## Comandos

```sh
bun run dev        # roda a TUI
bun test           # testes
bun run typecheck  # tsc --noEmit
bun run lint       # biome check
bun run verify     # test + typecheck + lint
bun run scripts/sync-workforce.mjs --dry-run
```