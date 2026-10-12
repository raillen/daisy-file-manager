# Estratégia de testes

## Pirâmide

| Camada | O que cobre | Como testa |
| --- | --- | --- |
| core | regras de negócio | `bun test` puro, sem UI |
| integração com fs | operações reais | `bun test` com diretório temporário |
| interface | render e teclado | `testRender` do `@opentui/solid` |
| regressão visual | não usada | não se aplica a terminal |

## Ferramentas do próprio OpenTUI

`testRender` monta uma raiz Solid em um renderer de teste em memória:

```ts
const setup = await testRender(() => <App />);
await setup.renderOnce();
setup.mockInput.typeText("...");
setup.dispose();
```

Para o núcleo imperativo existe `createTestRenderer`, que expõe `mockMouse`, `mockInput`, `captureCharFrame` e `waitForFrame`. Isso permite afirmar sobre o texto realmente desenhado na tela, não sobre a estrutura interna.

## Exemplo: filtro da listagem

```ts
test("filtro ignora itens ocultos quando pedido", () => {
  const entries = [file("a.txt"), file(".oculto"), file("b.txt")];
  const visible = filterEntries(entries, "", { showHidden: false });
  expect(visible.map((entry) => entry.name)).toEqual(["a.txt", "b.txt"]);
});
```

## Exemplo: operação de arquivo

```ts
test("copia arquivo para o destino", async () => {
  const directory = await mkdtemp(join(tmpdir(), "daisy-"));
  await writeFile(join(directory, "origem.txt"), "conteúdo");
  await copyEntry(join(directory, "origem.txt"), join(directory, "destino.txt"));
  expect(await readFile(join(directory, "destino.txt"), "utf8")).toBe("conteúdo");
  await rm(directory, { recursive: true, force: true });
});
```

## Regras

1. Teste descreve comportamento observável, não implementação.
2. Toda regra do `core` tem ao menos um teste de borda (vazio, ausente, erro).
3. Nenhum teste depende de ordem de execução ou de diretório de trabalho.
4. Testes de interface não tocam o disco: usam fixtures em memória.

## Executar

```sh
bun test
bun run verify   # teste + tipos + lint
```