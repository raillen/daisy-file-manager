# Workforce de agentes

O repositório carrega o próprio time de agentes e skills, versionado.

## O que é

`.agents/workforce/` é uma cópia do workforce do framework [Prumo](https://github.com/poppy-team/prumo): **39 agentes, 189 skills e 20 receitas**, com os manifests originais (proveniência, nível de risco, capacidades, handoff).

```text
.agents/workforce/
  agents/<id>/AGENT.md + manifest.json
  skills/<id>/SKILL.md + manifest.json + references/ templates/ checks/ scripts/
  recipes/<id>/RECIPE.md + recipe.json
  PROVENANCE.md
```

Detalhes de origem, commit e licença em [PROVENANCE.md](https://github.com/poppy-team/prumo).

## Quatro grupos

| Grupo | Serve para |
| --- | --- |
| `technical` | arquitetura, engines, qualidade, segurança, linguagens |
| `design` | design system, tokens, UI/UX, tipografia, ícones, motion |
| `accessibility` | contraste, foco, teclado, leitor de tela, zoom |
| `neurodivergence` | `cognitive-clarity` — comunicação de baixa carga cognitiva |

## Obrigação por tipo de trabalho

Antes de escrever código, o agente escolhe o par adequado:

| Trabalho | Agentes e skills |
| --- | --- |
| token, cor, ícone, tema, tradução | `design-system-engineer` + `design-tokens`, `icon-system`, `typography-system`, `color-science` |
| interface, layout, fluxo, copy | `ux-architect`, `ui-component-engineer`, `design-researcher` + `wireframing`, `interaction-design`, `user-flows` |
| acessibilidade | `accessibility-reviewer` + `accessibility`, `contrast`, `keyboard-accessibility`, `focus-management`, `screen-reader`, `zoom-reflow` |
| documentação e comunicação | `cognitive-clarity` |
| implementação e revisão | `implementer`, `reviewer`, `quality-reviewer`, `tester` + `clean-code`, `code-quality`, `architecture-quality`, `testing-quality` |

A regra está em `AGENTS.md` na raiz, então qualquer agente que abrir o projeto já a recebe.

## Instalação nos agentes locais

O workforce é vendorizado, nãomagicamente instalado. Para ativar nas ferramentas:

```sh
# ver o plano sem escrever
bun run scripts/sync-workforce.mjs --dry-run --targets=claude,opencode

# instalar tudo
bun run scripts/sync-workforce.mjs --targets=claude,opencode

# só a ala de design, acessibilidade e neurodivergência
bun run scripts/sync-workforce.mjs --groups=design,accessibility,neurodivergence
```

O script é idempotente, grava um state file por alvo e **não sobrescreve silenciosamente** arquivo modificado localmente: reporta como conflito e deixa intacto.

## Por que vendorizar em vez de instalar o CLI

O CLI do Prumo também funciona, e traz adapters prontos. Mas ele impõe o harness completo do framework — goals, locks com SHA-256, `prumo.json` — sobre o repositório. O daisy prefere um diretório versionado, previsível e que não muda o fluxo de trabalho de quem abre o projeto.