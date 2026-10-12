# Acessibilidade

Acessibilidade aqui não é camada extra. É requisito com o mesmo peso que performance.

## Teclado é caminho principal

Toda ação tem tecla. Toda lista é navegável. Todo painel é alcançável por `tab` na ordem lógica: barra de locais → lista → pré-visualização → barra de status.

Nada depende de cor, mouse ou hover:

| Nunca dependemos de | Usamos |
| --- | --- |
| só cor para significado | ícone + texto + cor |
| só hover | foco visível com a mesma informação |
| só mouse | tecla equivalente em 100% das ações |

## Foco visível

Todo elemento focável tem contorno de `border.focus` com deslocamento de 2px — o contorno nunca é cortado pelo container, e nunca some. O contraste do foco é verificado contra o fundo real em cada tema.

## Movimento

`prefers-reduced-motion: reduce` remove toda transição e animação. Nada de informação essencial chega por movimento: o que muda por animação também muda por texto.

## Texto selecionável

Texto é selecionável por padrão no terminal — clicar e arrastar copia caminho, nome e conteúdo. Seleção por palavra funciona em `foo/bar` como palavra inteira, respeitando a fronteira natural de caracteres.

## Rótulos e nomes acessíveis

Cada ícone decorativo é `aria-hidden`. Cada botão só com ícone tem `aria-label` que **muda com o estado**:

```text
"Não foi possível copiar"  ->  "Código copiado"
"Ativar tema escuro"       ->  "Ativar tema claro"
```

O usuário de leitor de tela nunca encontra um controle sem nome.

## Estrutura

O site usa HTML semântico com landmarks: `header`, `nav`, `main`, `aside`, e um skip-link para o conteúdo. No terminal, o equivalente em região é a hierarquia de painéis, que a leitura de tela segue na ordem de foco.

## Contraste

`fg.default` sobre `bg.default` e `fg.muted` sobre `bg.default` passam AA em ambos os temas — verificado por teste no site. Na TUI, os pares de cor de estado (seleção, erro, atenção) usam as variantes `-muted` para manter contraste em qualquer terminal.

## Verificação

Antes de dar uma tela por pronta:

1. navegar tudo só no teclado;
2. ampliar o zoom da fonte do terminal 2× e conferir quebra de layout;
3. desligar a cor (`OPENTUI_GRAPHICS=false`) e conferir que a informação continua legível;
4. rodar com `prefers-reduced-motion` ativo.