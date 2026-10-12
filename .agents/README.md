# .agents — workforce do projeto

Este diretório guarda o workforce de agentes e skills usado no daisy-file-manager, vendorizado do framework [Prumo](https://github.com/poppy-team/prumo).

```
.agents/
  workforce/       cópia versionada (agents/, skills/, recipes/)
  PROVENANCE.md    origem, commit, licença, atualização
```

## Grupos

| Grupo | Conteúdo | Obrigatório para |
| --- | --- | --- |
| `technical` | arquitetura, engines, qualidade, segurança, linguagens | qualquer implementação |
| `design` | design system, tokens, UI/UX, tipografia, ícones, motion | qualquer trabalho visual (TUI ou site) |
| `accessibility` | contraste, foco, teclado, leitor de tela, zoom | qualquer superfície de interface |
| `neurodivergence` | `cognitive-clarity` | comunicação, documentação e UX |

## Sincronização

```sh
bun run scripts/sync-workforce.mjs --dry-run --targets=claude,opencode
bun run scripts/sync-workforce.mjs --targets=claude --groups=design,accessibility,neurodivergence
```

Ver `.agents/workforce/PROVENANCE.md` para origem e atualização.