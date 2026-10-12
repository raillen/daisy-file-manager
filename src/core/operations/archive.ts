import { mkdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

export type ExtractionResult = {
  success: boolean;
  targetDirectory: string;
  error?: string;
};

export function isArchive(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".zip") ||
    lower.endsWith(".tar") ||
    lower.endsWith(".tar.gz") ||
    lower.endsWith(".tgz") ||
    lower.endsWith(".tar.bz2") ||
    lower.endsWith(".tbz2") ||
    lower.endsWith(".tar.xz") ||
    lower.endsWith(".txz") ||
    lower.endsWith(".gz")
  );
}

export function defaultExtractionFolder(archivePath: string): string {
  const base = basename(archivePath);
  const dir = dirname(archivePath);
  const nameWithoutExt = base.replace(/\.tar\.(gz|bz2|xz)$/i, "").replace(/\.(zip|tar|tgz|tbz2|txz|gz)$/i, "");
  return join(dir, nameWithoutExt);
}

export async function extractArchive(archivePath: string, destinationDirectory?: string): Promise<ExtractionResult> {
  const resolvedArchive = resolve(archivePath);
  const targetDir = resolve(destinationDirectory ?? defaultExtractionFolder(archivePath));

  try {
    await mkdir(targetDir, { recursive: true });

    const lower = resolvedArchive.toLowerCase();
    let command: string[];

    if (lower.endsWith(".zip")) {
      command = ["unzip", "-q", "-o", resolvedArchive, "-d", targetDir];
    } else if (
      lower.endsWith(".tar") ||
      lower.endsWith(".tar.gz") ||
      lower.endsWith(".tgz") ||
      lower.endsWith(".tar.bz2") ||
      lower.endsWith(".tbz2") ||
      lower.endsWith(".tar.xz") ||
      lower.endsWith(".txz") ||
      lower.endsWith(".gz")
    ) {
      command = ["tar", "-xf", resolvedArchive, "-C", targetDir];
    } else {
      return {
        success: false,
        targetDirectory: targetDir,
        error: "Formato de arquivo não suportado",
      };
    }

    const proc = Bun.spawn(command, {
      stdout: "ignore",
      stderr: "pipe",
    });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      return {
        success: false,
        targetDirectory: targetDir,
        error: stderr.trim() || `Código de saída ${exitCode}`,
      };
    }

    return {
      success: true,
      targetDirectory: targetDir,
    };
  } catch (err) {
    return {
      success: false,
      targetDirectory: targetDir,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
