import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defaultExtractionFolder, extractArchive, isArchive } from "../src/core/operations/archive";

describe("archive", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "daisy-archive-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("isArchive identifica extensões suportadas", () => {
    expect(isArchive("backup.zip")).toBe(true);
    expect(isArchive("archive.tar.gz")).toBe(true);
    expect(isArchive("package.tgz")).toBe(true);
    expect(isArchive("source.tar.xz")).toBe(true);
    expect(isArchive("document.txt")).toBe(false);
    expect(isArchive("photo.png")).toBe(false);
  });

  test("defaultExtractionFolder remove extensões corretamente", () => {
    expect(defaultExtractionFolder("/tmp/bundle.tar.gz")).toBe("/tmp/bundle");
    expect(defaultExtractionFolder("/tmp/files.zip")).toBe("/tmp/files");
    expect(defaultExtractionFolder("/home/user/app.tgz")).toBe("/home/user/app");
  });

  test("extrai arquivo tar.gz com sucesso", async () => {
    const fileToArchive = join(tempDir, "hello.txt");
    await writeFile(fileToArchive, "daisy test archive content");

    const tarPath = join(tempDir, "test.tar.gz");
    const proc = Bun.spawn(["tar", "-czf", tarPath, "-C", tempDir, "hello.txt"]);
    await proc.exited;

    const outDir = join(tempDir, "extracted");
    const result = await extractArchive(tarPath, outDir);

    expect(result.success).toBe(true);
    expect(result.targetDirectory).toBe(outDir);

    const extractedContent = await Bun.file(join(outDir, "hello.txt")).text();
    expect(extractedContent).toBe("daisy test archive content");
  });
});
