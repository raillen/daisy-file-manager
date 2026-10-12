import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readDirectory } from "../src/core/entries/directory";
import { isInside, parentOf, segmentsFor, shortPath } from "../src/core/entries/path";
import { filterEntries, fuzzyMatch, sortEntries } from "../src/core/entries/sort";

let root = "";

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daisy-entries-"));
  await mkdir(join(root, "pasta"), { recursive: true });
  await writeFile(join(root, "arquivo.txt"), "conteúdo", "utf8");
  await writeFile(join(root, ".oculto"), "", "utf8");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("readDirectory", () => {
  test("lê diretórios, arquivos e ocultos", async () => {
    const entries = await readDirectory(root);
    const names = entries.map((entry) => entry.name).sort();

    expect(names).toEqual([".oculto", "arquivo.txt", "pasta"]);
  });

  test("classifica tipo e permissões", async () => {
    const entries = await readDirectory(root);
    const file = entries.find((entry) => entry.name === "arquivo.txt");
    const directory = entries.find((entry) => entry.name === "pasta");

    expect(file?.kind).toBe("text");
    expect(file?.isDirectory).toBe(false);
    expect(file?.size).toBe(9);
    expect(file?.permissions).toMatch(/^[d-][rwx-]{9}$/);
    expect(directory?.kind).toBe("directory");
    expect(directory?.isDirectory).toBe(true);
    expect(directory?.permissions).toMatch(/^d[rwx-]{9}$/);
  });

  test("representa bit de execução", async () => {
    await chmod(join(root, "arquivo.txt"), 0o755);
    const executable = (await readDirectory(root)).find((entry) => entry.name === "arquivo.txt");

    expect(executable?.permissions).toBe("-rwxr-xr-x");
  });

  test("marca link simbólico sem quebrar", async () => {
    await symlink(join(root, "arquivo.txt"), join(root, "atalho"));
    const entries = await readDirectory(root);
    const link = entries.find((entry) => entry.name === "atalho");

    expect(link?.isSymlink).toBe(true);
    expect(link?.kind).toBe("symlink");
  });
});

describe("sortEntries", () => {
  test("diretórios primeiro, depois por nome", async () => {
    const entries = await readDirectory(root);
    const sorted = sortEntries(entries, { field: "name", descending: false, directoriesFirst: true });

    expect(sorted[0]?.name).toBe("pasta");
    expect(sorted.slice(1).map((entry) => entry.name)).toEqual([".oculto", "arquivo.txt"]);
  });

  test("descendente inverte a ordem", async () => {
    const entries = await readDirectory(root);
    const sorted = sortEntries(entries, { field: "name", descending: true, directoriesFirst: false });

    expect(sorted[0]?.name).toBe("pasta");
  });
});

describe("filterEntries", () => {
  test("esconde ocultos por padrão", async () => {
    const entries = await readDirectory(root);

    expect(filterEntries(entries, "", false).map((entry) => entry.name)).not.toContain(".oculto");
    expect(filterEntries(entries, "", true).map((entry) => entry.name)).toContain(".oculto");
  });

  test("filtro fuzzy por subsequence", async () => {
    expect(fuzzyMatch("config.json", "cfgjs")).toBe(true);
    expect(fuzzyMatch("config.json", "xyz")).toBe(false);
  });
});

describe("paths", () => {
  test("parentOf sobe um nível e para na raiz", () => {
    expect(parentOf("/tmp/a/b")).toBe("/tmp/a");
    expect(parentOf("/")).toBeNull();
  });

  test("isInside respeita o limite de segmento", () => {
    expect(isInside("/tmp/projeto/src", "/tmp/projeto")).toBe(true);
    expect(isInside("/tmp/projetos", "/tmp/projeto")).toBe(false);
  });

  test("shortPath troca home por til", () => {
    expect(shortPath("/home/raillen/Documentos", "/home/raillen")).toBe("~/Documentos");
    expect(shortPath("/tmp", "/home/raillen")).toBe("/tmp");
  });

  test("segmentsFor monta o breadcrumb com til na home", () => {
    const segments = segmentsFor("/home/raillen/Documentos", "/home/raillen");

    expect(segments[0]?.name).toBe("~");
    expect(segments[0]?.path).toBe("/home/raillen");
    expect(segments.at(-1)?.name).toBe("Documentos");
  });

  test("segmentsFor fora da home começa na raiz", () => {
    const segments = segmentsFor("/tmp/projeto", "/home/raillen");

    expect(segments.map((segment) => segment.name)).toEqual(["/", "tmp", "projeto"]);
  });
});
