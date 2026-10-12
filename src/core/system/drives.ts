import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { basename } from "node:path";

export type LsblkDevice = {
  name: string;
  path?: string;
  mountpoint: string | null;
  label: string | null;
  size?: string;
  rm?: boolean;
  hotplug?: boolean;
  tran?: string | null;
  type?: string;
  fstype?: string | null;
  children?: LsblkDevice[];
};

export type DriveDevice = {
  name: string;
  path: string;
  mountpoint: string;
  label: string;
  size: string;
  isRemovable: boolean;
  fstype?: string;
};

export function parseLsblkJson(json: string): DriveDevice[] {
  try {
    const data = JSON.parse(json) as { blockdevices?: LsblkDevice[] };
    if (!data.blockdevices || !Array.isArray(data.blockdevices)) return [];

    const result: DriveDevice[] = [];

    function processDevice(dev: LsblkDevice, parentIsRemovable = false) {
      const isRemovable =
        parentIsRemovable ||
        Boolean(dev.rm) ||
        Boolean(dev.hotplug) ||
        dev.tran === "usb" ||
        (dev.mountpoint !== null && (dev.mountpoint.startsWith("/run/media") || dev.mountpoint.startsWith("/media")));

      if (dev.mountpoint && dev.mountpoint !== "[SWAP]" && !dev.mountpoint.startsWith("/boot")) {
        const label =
          dev.label && dev.label.trim() !== ""
            ? dev.label.trim()
            : dev.mountpoint === "/"
              ? "Sistema (/)"
              : basename(dev.mountpoint);

        result.push({
          name: dev.name,
          path: dev.path ?? `/dev/${dev.name}`,
          mountpoint: dev.mountpoint,
          label,
          size: dev.size ?? "",
          isRemovable,
          fstype: dev.fstype ?? undefined,
        });
      }

      if (dev.children && Array.isArray(dev.children)) {
        for (const child of dev.children) {
          processDevice(child, isRemovable);
        }
      }
    }

    for (const dev of data.blockdevices) {
      processDevice(dev);
    }

    return result;
  } catch {
    return [];
  }
}

function runCommand(cmd: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => resolve({ code: -1, stdout: "", stderr: err.message }));
    child.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }));
  });
}

export async function listDrives(): Promise<DriveDevice[]> {
  const result = await runCommand("lsblk", ["-J", "-o", "NAME,PATH,MOUNTPOINT,LABEL,SIZE,RM,HOTPLUG,TRAN,TYPE,FSTYPE"]);
  if (result.code !== 0) return [];
  return parseLsblkJson(result.stdout);
}

export async function unmountDrive(drive: DriveDevice): Promise<{ success: boolean; error?: string }> {
  const udisks = await runCommand("udisksctl", ["unmount", "-b", drive.path]);
  if (udisks.code === 0) return { success: true };

  const umount = await runCommand("umount", [drive.mountpoint]);
  if (umount.code === 0) return { success: true };

  return {
    success: false,
    error: udisks.stderr.trim() || umount.stderr.trim(),
  };
}

export function createDrivesWatcher(onChange: (drives: DriveDevice[]) => void, intervalMs = 3000): () => void {
  let active = true;
  let lastFingerprint = "";

  async function check() {
    if (!active) return;
    const drives = await listDrives();
    if (!active) return;
    const fingerprint = JSON.stringify(drives.map((d) => `${d.path}:${d.mountpoint}:${d.label}`));
    if (fingerprint !== lastFingerprint) {
      lastFingerprint = fingerprint;
      onChange(drives);
    }
  }

  void check();
  const timer = setInterval(() => {
    void check();
  }, intervalMs);

  const watchers: Array<{ close: () => void }> = [];
  const candidateDirs = ["/run/media", "/media"];
  for (const dir of candidateDirs) {
    if (existsSync(dir)) {
      try {
        const w = watch(dir, { recursive: true }, () => {
          void check();
        });
        watchers.push(w);
      } catch {
        // recursive watch fallback
      }
    }
  }

  return () => {
    active = false;
    clearInterval(timer);
    for (const w of watchers) {
      try {
        w.close();
      } catch {
        // ignore close error
      }
    }
  };
}
