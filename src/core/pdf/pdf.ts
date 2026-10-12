import { createHash } from "node:crypto";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type PdfInfo = {
  pages: number;
  title?: string;
  author?: string;
};

let rendererAvailable: boolean | undefined;

export async function hasPdfRenderer(): Promise<boolean> {
  if (rendererAvailable !== undefined) return rendererAvailable;
  try {
    const proc = Bun.spawn(["which", "pdftoppm"], { stdout: "pipe", stderr: "pipe" });
    await proc.exited;
    rendererAvailable = proc.exitCode === 0;
    return rendererAvailable;
  } catch {
    rendererAvailable = false;
    return false;
  }
}

export async function getPdfInfo(filePath: string): Promise<PdfInfo> {
  try {
    const proc = Bun.spawn(["pdfinfo", filePath], { stdout: "pipe", stderr: "pipe" });
    const text = await new Response(proc.stdout).text();
    await proc.exited;

    if (proc.exitCode === 0) {
      let pages = 1;
      let title: string | undefined;
      let author: string | undefined;

      for (const line of text.split("\n")) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();

        if (key === "Pages") {
          const parsed = Number.parseInt(val, 10);
          if (!Number.isNaN(parsed) && parsed > 0) pages = parsed;
        } else if (key === "Title" && val.length > 0) {
          title = val;
        } else if (key === "Author" && val.length > 0) {
          author = val;
        }
      }
      return { pages, title, author };
    }
  } catch {
    // Fallback abaixo
  }

  try {
    const content = await Bun.file(filePath).text();
    const match = content.match(/\/Count\s+(\d+)/);
    const pages = match?.[1] ? Number.parseInt(match[1], 10) : 1;
    return { pages: Math.max(1, Number.isNaN(pages) ? 1 : pages) };
  } catch {
    return { pages: 1 };
  }
}

export async function extractPdfText(filePath: string, page?: number): Promise<string> {
  try {
    const args = ["pdftotext"];
    if (page !== undefined) {
      args.push("-f", String(page), "-l", String(page));
    }
    args.push(filePath, "-");
    const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
    const text = await new Response(proc.stdout).text();
    await proc.exited;

    if (proc.exitCode === 0) {
      return text.trim();
    }
  } catch {
    // Ignorado
  }
  return "";
}

export async function renderPdfPage(filePath: string, page: number, dpi = 150): Promise<string | undefined> {
  try {
    const stats = statSync(filePath);
    const hash = createHash("md5").update(`${filePath}:${stats.mtimeMs}:${dpi}`).digest("hex").slice(0, 12);

    const cacheDir = join(tmpdir(), "daisy-pdf-cache");
    mkdirSync(cacheDir, { recursive: true });

    const targetPng = join(cacheDir, `${hash}-p${page}.png`);
    if (existsSync(targetPng)) {
      return targetPng;
    }

    const outputPrefix = join(cacheDir, `${hash}-p${page}`);
    const proc = Bun.spawn(
      ["pdftoppm", "-png", "-r", String(dpi), "-f", String(page), "-singlefile", filePath, outputPrefix],
      { stdout: "pipe", stderr: "pipe" },
    );
    await proc.exited;

    if (proc.exitCode === 0 && existsSync(targetPng)) {
      return targetPng;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
