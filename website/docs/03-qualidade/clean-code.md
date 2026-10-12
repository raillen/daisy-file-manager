# Clean code

As regras que valem para o daisy inteiro, sem exceção.

## Uma responsabilidade por módulo

Um arquivo faz uma coisa. `src/core/entries/kind.ts` classifica arquivos. `src/core/theme/icons.ts` resolve ícones. Nada de arquivo "utilidades" com 40 função.

## Funções pequenas e nomeadas

O nome diz o verbo e o alvo:

```ts
export function kindFromName(name: string): EntryKind
export function resolveIconPath(entry: Entry): string
export async function moveToTrash(paths: string[]): Promise<void>
```

Sem `handle`, `process`, `doIt`, `data2`.

## Fronteiras que não se cruzam

| De → Para | Permitido |
| --- | --- |
| `app/` → `state/` | sim |
| `app/` → `commands/` | só `dispatch` |
| `state/` → `core/` | sim |
| `core/` → Solid | **nunca** |
| `core/` → `state/` | **nunca** |

O `core` é puro e testável sem renderer. Isso é o que permite `bun test` rodar em milissegundos.

## Tipos no lugar de strings soltas

```ts
export type SortField = "name" | "size" | "modified" | "kind";
```

Erro de digitação vira erro de compilação, não bug em produção.

## Zero `any`, zero assertion não-nula

Se o tipo não é o valor real, corrige-se o tipo. Se o valor pode faltar, o tipo diz que pode — e o código trata.

## Dados no lugar de lógica hard-coded

- cores, ícones, textos → `design/`
- atalhos → `keymap` no `config.toml`
- validação de configuração → tabela-driven em `parser.ts`

Nenhum `if (key === "x")` espalhado. Nenhum `#ff00ff` solto.

## Comentário só quando o porquê não é óbvio

```ts
// errado: incrementa o contador
counter += 1;

// certo: o scrollback precisa de 2 células para a borda inferior do bloco
const reservedRows = 2;
```

## Erro tratado onde nasce

Falha de disco vira `Result` ou exceção tipada no `core`; a camada de interface decide se vira notificação, diálogo ou linha de status. Error silencioso é bug.