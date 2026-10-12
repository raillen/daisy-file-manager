# Proveniência do workforce

Este diretório é uma cópia versionada do workforce do **Prumo**, mantida no repositório como fonte única.

| Campo | Valor |
| --- | --- |
| Origem | `https://github.com/poppy-team/prumo/tree/main/src/prumo/resources/workforce` |
| Commit | `e213260c99d22c89bf31890ec595a89725031c71` |
| Licença | MIT (ver `LICENSE` do repositório de origem) |
| Conteúdo | 39 agentes, 189 skills, 20 receitas |

## Formato de origem

```
agents/<id>/AGENT.md + manifest.json
skills/<id>/SKILL.md + manifest.json + references/ templates/ checks/ scripts/ examples/
recipes/<id>/RECIPE.md + recipe.json
```

Os manifests originais são preservados, incluindo `provenance`, `risk_level`, `capabilities` e `handoff_to`.

## Atualização

```sh
git -C /tmp clone --depth 1 --filter=blob:none --sparse <repo> prumo
git -C prumo sparse-checkout set src/prumo/resources/workforce
cp -r prumo/src/prumo/resources/workforce .agents/workforce
```

Depois atualize o commit nesta tabela e rode `bun run scripts/sync-workforce.mjs --dry-run`.

## Instalação nos agentes locais

O workforce é vendorizado, não instalado automaticamente. Para ativá-lo nas ferramentas locais:

```sh
bun run scripts/sync-workforce.mjs --targets=claude,opencode
bun run scripts/sync-workforce.mjs --groups=design,accessibility,neurodivergence --dry-run
```

O script é idempotente, mantém um state file por alvo e nunca sobrescreve silenciosamente um arquivo modificado localmente (reporta como conflito).