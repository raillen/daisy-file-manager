import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readDirectory } from "../src/core/entries/directory";
import { cacheKeyFor, createPreviewCache } from "../src/core/preview/cache";
import { previewFor } from "../src/core/preview/preview";

let root = "";
const limits = { maxTextBytes: 4096 };

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daisy-preview-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function entryFor(name: string) {
  const entries = await readDirectory(root);
  const entry = entries.find((item) => item.name === name);
  if (entry === undefined) throw new Error(`fixture ausente: ${name}`);
  return entry;
}

describe("previewFor", () => {
  test("imagem por extensão", async () => {
    await writeFile(join(root, "foto.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const preview = await previewFor(await entryFor("foto.png"), limits);

    expect(preview.kind).toBe("image");
    expect(preview.filetype).toBe("png");
  });

  test("texto com filetype inferido", async () => {
    await writeFile(join(root, "codigo.ts"), "export const x = 1;\n", "utf8");
    const preview = await previewFor(await entryFor("codigo.ts"), limits);

    expect(preview.kind).toBe("text");
    expect(preview.filetype).toBe("ts");
    expect(preview.content).toContain("export const");
  });

  test("markdown é texto", async () => {
    await writeFile(join(root, "leia.md"), "# título\n", "utf8");
    const preview = await previewFor(await entryFor("leia.md"), limits);

    expect(preview.kind).toBe("text");
    expect(preview.filetype).toBe("md");
  });

  test("arquivo acima do limite vira metadados", async () => {
    await writeFile(join(root, "grande.txt"), "x".repeat(8192), "utf8");
    const preview = await previewFor(await entryFor("grande.txt"), limits);

    expect(preview.kind).toBe("metadata");
  });

  test("binário com byte nulo vira metadados", async () => {
    await writeFile(join(root, "binario.dat"), Buffer.from([0x00, 0x01, 0x02]));
    const preview = await previewFor(await entryFor("binario.dat"), limits);

    expect(preview.kind).toBe("metadata");
  });

  test("diretório conta itens e subpastas", async () => {
    await mkdir(join(root, "docs"), { recursive: true });
    await mkdir(join(root, "docs", "src"), { recursive: true });
    await writeFile(join(root, "docs", "leia.md"), "#", "utf8");

    const preview = await previewFor(await entryFor("docs"), limits);
    expect(preview.kind).toBe("directory");
    expect(preview.folderCount).toBe(1);
    expect(preview.childCount).toBe(2);
  });

  test("pdf gera preview com kind pdf e páginas", async () => {
    const minimalPdf =
      "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [] /Count 1 >> endobj\ntrailer << /Size 3 /Root 1 0 R >>\n%%EOF";
    await writeFile(join(root, "doc.pdf"), minimalPdf, "utf8");
    const preview = await previewFor(await entryFor("doc.pdf"), limits);

    expect(preview.kind).toBe("pdf");
    expect(preview.filetype).toBe("pdf");
    expect(preview.pdfPages).toBe(1);
  });
});

describe("cache de preview", () => {
  test("cacheia por caminho+tamanho+mtime", async () => {
    await writeFile(join(root, "a.txt"), "primeiro", "utf8");
    const cache = createPreviewCache(limits);

    const first = await cache.get(await entryFor("a.txt"));
    await writeFile(join(root, "a.txt"), "segundo", "utf8");
    const second = await cache.get(await entryFor("a.txt"));

    expect(first.content).toBe("primeiro");
    expect(second.content).toBe("segundo");
  });

  test("cacheKeyFor muda quando mtime muda", async () => {
    const entry = await entryForAfter("b.txt");
    const before = cacheKeyFor(entry);
    const after = cacheKeyFor({ ...entry, modifiedMs: (entry.modifiedMs ?? 0) + 1000 });

    expect(before).not.toBe(after);
  });

  test("clear esvazia", async () => {
    await writeFile(join(root, "c.txt"), "x", "utf8");
    const cache = createPreviewCache(limits);
    await cache.get(await entryFor("c.txt"));
    cache.clear();

    const next = await cache.get(await entryFor("c.txt"));
    expect(next.kind).toBe("text");
  });
});

async function entryForAfter(name: string) {
  await writeFile(join(root, name), "x", "utf8");
  return entryFor(name);
}
