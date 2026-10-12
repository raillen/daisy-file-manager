import { type ChildProcess, spawn } from "node:child_process";

export type TrashResult = {
  ok: boolean;
  method: "gio" | "recycle" | "none";
  error: string | undefined;
};

function run(command: string, args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", () => resolve({ code: -1, stderr: "comando indisponivel" }));
    child.on("close", (code) => resolve({ code: code ?? -1, stderr }));
  });
}

export async function moveToTrash(paths: string[]): Promise<TrashResult> {
  if (paths.length === 0) return { ok: true, method: "none", error: undefined };

  const gio = await run("gio", ["trash", ...paths]);
  if (gio.code === 0) return { ok: true, method: "gio", error: undefined };

  return { ok: false, method: "gio", error: gio.stderr.trim() || "gio trash falhou" };
}

function launchDetached(command: string, args: string[]): void {
  const child: ChildProcess = spawn(command, args, { detached: true, stdio: "ignore" });
  child.unref();
}

export function openExternally(path: string): boolean {
  const commands =
    process.platform === "darwin"
      ? ["open", path]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", path]
        : ["xdg-open", path];

  launchDetached(commands[0] as string, commands.slice(1));
  return true;
}

export function revealInFileManager(path: string): boolean {
  if (process.platform === "darwin") {
    launchDetached("open", ["-R", path]);
    return true;
  }

  return openExternally(path);
}
