# Tokens e temas

## Onde os tokens vivem

```text
design/
  tokens/
    colors.json     cor semântica por tema
    icons.json      nome semântico -> phosphor / unicode / nerd / cor
    metrics.json    espaçamento, tipografia, raio
  i18n/
    pt-BR.json      dicionário canônico
    en-US.json      espelho em inglês
```

Esse diretório é a fonte única. A TUI importa os JSONs; o site busca os mesmos arquivos e transforma em custom properties do CSS. Não existe cópia.

## Cores são semânticas, nunca literais

O nome do token diz o **papel**, não a cor:

| Token | Papel |
| --- | --- |
| `bg.default` | fundo principal |
| `bg.muted` | fundo secundário |
| `bg.selectedRow` | linha selecionada |
| `fg.default` | texto principal |
| `fg.muted` | texto secundário |
| `fg.directory` | nome de diretório |
| `fg.executable` | arquivo executável |
| `fg.symlink` | link simbólico |
| `fg.hidden` | arquivo oculto |
| `border.focus` | borda de foco |

`#7d5fff` não aparece em componente nenhum. `fg.accent` aparece.

## Adicionar um tema

1. acrescente o valor no bloco `dark` e no bloco `light` de `colors.json`;
2. rode `bun test tests/palette.test.ts` — o teste falha se um tema ficou sem um token.

Como a forma do JSON é `nome → { light, dark }`, themes futuros exigem mudar essa forma para um mapa de temas. A decisão está registrada no [ADR 001](../../docs/adr/001-tokenizacao-canonica.md).

## Como o site usa

`website/scripts/theme.mjs` busca `colors.json`, converte `bg.default` em `--bg-default` e aplica a paleta do tema ativo na raiz. O `tokens.css` traz os mesmos valores como fallback estático, então o site continua legível mesmo se o fetch falhar.

## Personalização

Quem quiser mudar cor só na própria máquina usa o bloco `[colors]` do `config.toml` — não edita o token global. Ver [Configuração](00-guide/configuracao.md).