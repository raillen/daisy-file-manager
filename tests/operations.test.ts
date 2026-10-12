import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createDirectory,
  createEmptyFile,
  itemsFor,
  OperationCancelled,
  renameEntry,
  runOperation,
  TargetExists,
  targetFor,
} from "../src/core/operations/operations";

let root = "";
let source = "";
let destination = "";

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daisy-ops-"));
  source = join(root, "origem");
  destination = join(root, "destino");
  await mkdir(source, { recursive: true });
  await mkdir(destination, { recursive: true });
  await writeFile(join(source, "um.txt"), "conteudo um", "utf8");
  await writeFile(join(source, "dois.txt"), "conteudo dois", "utf8");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("runOperation copy", () => {
  test("copia recursivamente e reporta progresso", async () => {
    const items = itemsFor([join(source, "um.txt"), join(source, "dois.txt")], destination);
    const progress: number[] = [];

    await runOperation("copy", items, {
      signal: new AbortController().signal,
      onProgress: (event) => progress.push(event.current),
    }).promise;

    expect(await readFile(join(destination, "um.txt"), "utf8")).toBe("conteudo um");
    expect(await readFile(join(destination, "dois.txt"), "utf8")).toBe("conteudo dois");
    expect(progress).toEqual([1, 2]);
  });

  test("copia pasta inteira", async () => {
    await mkdir(join(source, "sub"), { recursive: true });
    await writeFile(join(source, "sub", "interno.txt"), "x", "utf8");

    await runOperation("copy", itemsFor([source], destination), {
      signal: new AbortController().signal,
      onProgress: () => {},
    }).promise;

    expect((await stat(join(destination, "origem", "sub", "interno.txt"))).isFile()).toBe(true);
  });

  test("destino existente gera conflito sem sobrescrever", async () => {
    await writeFile(join(destination, "um.txt"), "existente", "utf8");

    const handle = runOperation("copy", itemsFor([join(source, "um.txt")], destination), {
      signal: new AbortController().signal,
      onProgress: () => {},
    });

    await expect(handle.promise).rejects.toBeInstanceOf(TargetExists);
    expect(await readFile(join(destination, "um.txt"), "utf8")).toBe("existente");
  });

  test("overwrite substitui", async () => {
    await writeFile(join(destination, "um.txt"), "existente", "utf8");

    await runOperation("copy", itemsFor([join(source, "um.txt")], destination), {
      signal: new AbortController().signal,
      onProgress: () => {},
      overwrite: true,
    }).promise;

    expect(await readFile(join(destination, "um.txt"), "utf8")).toBe("conteudo um");
  });

  test("cancelamento interrompe antes do próximo item", async () => {
    const controller = new AbortController();
    const items = itemsFor([join(source, "um.txt"), join(source, "dois.txt")], destination);

    const handle = runOperation("copy", items, {
      signal: controller.signal,
      onProgress: () => controller.abort(),
    });

    await expect(handle.promise).rejects.toBeInstanceOf(OperationCancelled);
    await expect(stat(join(destination, "dois.txt"))).rejects.toThrow();
  });

  test("handle.cancel impede a execucao ja abortada", async () => {
    const controller = new AbortController();
    controller.abort();

    const handle = runOperation("copy", itemsFor([join(source, "um.txt")], destination), {
      signal: controller.signal,
      onProgress: () => {},
    });
    handle.cancel();

    await expect(handle.promise).rejects.toBeInstanceOf(OperationCancelled);
    await expect(stat(join(destination, "um.txt"))).rejects.toThrow();
  });
});

describe("runOperation move", () => {
  test("move remove da origem", async () => {
    await runOperation("move", itemsFor([join(source, "um.txt")], destination), {
      signal: new AbortController().signal,
      onProgress: () => {},
    }).promise;

    expect((await stat(join(destination, "um.txt"))).isFile()).toBe(true);
    await expect(stat(join(source, "um.txt"))).rejects.toThrow();
  });
});

describe("criação e renomeação", () => {
  test("createDirectory cria pasta", async () => {
    const path = join(root, "nova");
    await createDirectory(path);

    expect((await stat(path)).isDirectory()).toBe(true);
  });

  test("createDirectory falha se já existe", async () => {
    await createDirectory(join(root, "nova"));

    await expect(createDirectory(join(root, "nova"))).rejects.toThrow();
  });

  test("createEmptyFile cria arquivo vazio", async () => {
    const path = join(root, "vazio.txt");
    await createEmptyFile(path);

    expect(await readFile(path, "utf8")).toBe("");
    await expect(createEmptyFile(path)).rejects.toThrow();
  });

  test("renameEntry renomeia", async () => {
    const from = join(source, "um.txt");
    const to = join(source, "renomeado.txt");
    await renameEntry(from, to);

    expect((await stat(to)).isFile()).toBe(true);
  });

  test("renameEntry protege destino existente", async () => {
    const from = join(source, "um.txt");
    const to = join(source, "dois.txt");

    await expect(renameEntry(from, to)).rejects.toBeInstanceOf(TargetExists);
    expect((await stat(from)).isFile()).toBe(true);
  });
});

describe("targetFor", () => {
  test("usa apenas o nome base", () => {
    expect(targetFor("/a/b/c.txt", "/destino")).toBe("/destino/c.txt");
  });
});
