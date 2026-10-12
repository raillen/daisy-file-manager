# Sobre

## O que é

O **daisy** é um gerenciador de arquivos TUI construído com [OpenTUI](https://opentui.com) (núcleo nativo em Zig), Solid.js e TypeScript, executado sobre o Bun.

A referência de experiência é o Nautilus: lugares à esquerda, arquivos no centro, pré-visualização à direita, barra de status embaixo. A referência de Conveniência é o Yazi: teclado em primeiro lugar, operações rápidas, composição com o shell.

## Decisões de projeto

- **Bun como único runtime.** O OpenTUI exige Node 26.4 ou superior para rodar fora do Bun; o Bun também gera binário único com `bun build --compile`.
- **Solid 1.9.12 exato.** O binding do OpenTUI exige essa versão específica.
- **Componentes intrínsecos em `snake_case`.** `scrollbox`, `tab_select`, `ascii_font` — é a convenção do reconciliador.
- **Zero literal de design.** Ver [Tokens e temas](02-design/tokens.md).

## Licença

A ver com o time. O workforce de agentes em `.agents/workforce/` vem do framework Prumo sob licença MIT.

## Próximos passos

Consulte o [roadmap](04-roadmap/fases.md) para saber o que já foi entregue e o que vem depois.