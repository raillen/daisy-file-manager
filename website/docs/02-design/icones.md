# Ícones

## Registro semântico

Ícone é escolhido por **nome**, nunca colado no componente:

```text
ui.home · ui.search · ui.newFolder · view.list · status.warning
file.directory · file.image · file.code · file.pdf
```

Cada entrada em `design/tokens/icons.json` guarda quatro coisas:

| Campo | Para quê |
| --- | --- |
| `phosphor` | classe do ícone no site |
| `unicode` | fallback para terminal sem Nerd Font |
| `nerd` | codepoint Nerd Font, quando confiável |
| `color` | token semântico de cor |

## Três camadas, um nome

O componente chama `glyph("file.directory", iconSet)`. Quem resolve decide a camada:

1. **Nerd Font** — glifo colorido, o melhor resultado;
2. **Unicode** — símbolo simples, sempre disponível;
3. **Biblioteca** — para arquivo por extensão, o `@m234/nerd-fonts` decide (é o mapeamento autoritativo, com thousands de extensões).

## Regra do codepoint confiável

Nerd Fonts mistura glifos com origens diferentes: a faixa Font Awesome 4 é estável e verificada; glifos `dev-*` variam entre variantes da fonte. Então:

- entrou codepoint na faixa FA4, ele entrou no registro;
- fora da faixa, o campo `nerd` fica `null` e o Unicode cobre;
- quem quiser o glifo por extensão usa a biblioteca.

Isso evita o pior defeito possível de ícone: o glifo certo no terminal errado.

## Ícone de arquivo

O tipo vem da extensão ou do nome exato, nessa ordem:

```text
kindFromName("main.ts")         -> code
kindFromName("photo.PNG")       -> image
kindFromName("package.json")    -> package   (nome exato vence extensão)
kindFromName("LICENSE")         -> generic
```

Depois o tipo vira nome semântico (`kindIcons.ts`) e o registro vira glifo. Nenhum passo conhece o terminal.

## Personalização

`iconSet = "unicode"` no `config.toml` força o fallback para quem não tem Nerd Font.