# Instalação

## Requisitos

| Item | Versão | Motivo |
| --- | --- | --- |
| Bun | 1.4 ou superior | único runtime suportado (OpenTUI exige Node 26.4+ fora do Bun) |
| Nerd Font | qualquer uma | ícones coloridos; sem ela o app usa glifos Unicode |

## Do repositório

```sh
bun install
bun run dev
```

O processo abre a TUI no diretório atual.

## Binário único

```sh
bun build --compile ./index.tsx --outfile ./daisy
```

O Bun embute a biblioteca nativa do OpenTUI, o worker de parser e as gramáticas padrão. Para gerar também a variante Alpine:

```sh
bun build --compile ./index.tsx --outfile ./daisy-linux-x64-musl \
  --define 'process.env.OPENTUI_LIBC="musl"'
```

## Fontes e emoji

Se o terminal não tiver Nerd Font, os ícones degradam para símbolos Unicode — o app continua funcionando, só perde cor. Para trocar o conjunto de ícones:

```sh
# em ~/.config/daisy/config.json
{ "iconSet": "unicode" }
```

## Diagnóstico

Se a TUI não abrir, verifique:

```sh
bun --version
echo $TERM
```

`OPENTUI_IMAGE_PROTOCOL` controla o protocolo de imagem usado na pré-visualização (`auto`, `kitty`, `sixel`, `blocks`). Sob tmux, `auto` escolhe blocos Unicode.