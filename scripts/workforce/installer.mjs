import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

import { STATE_FILE } from "./targets.mjs";

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function emptyResult() {
  return { written: [], removed: [], conflicts: [], installed: {} };
}

async function writeFileIfChanged(path, content, result, dryRun) {
  let current;
  try {
    current = await readFile(path, "utf8");
  } catch {
    current = undefined;
  }
  if (current === content) return;
  result.written.push(path);
  if (dryRun) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

export async function collectFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectFiles(path)));
    } else {
      found.push(path);
    }
  }
  return found;
}

function agentDocument(entry) {
  const tools = entry.riskLevel === "low" ? "Read, Grep, Glob, Write, Edit" : "Read, Grep, Glob";
  const frontmatter = [
    "---",
    `name: ${entry.id}`,
    `description: ${entry.purpose || entry.id}`,
    `tools: ${tools}`,
    "---",
    "",
  ].join("\n");
  return `${frontmatter}\n${entry.body}`;
}

export async function installAgent(entry, target, result, dryRun) {
  const path = join(target.agentsDir, `${entry.id}.md`);
  const content = agentDocument(entry);
  await writeFileIfChanged(path, content, result, dryRun);
  result.installed[path] = hash(content);
}

export async function installSkill(entry, target, result, dryRun) {
  const destination = join(target.skillsDir, entry.id);
  for (const file of await collectFiles(entry.directory)) {
    const path = join(destination, relative(entry.directory, file));
    const content = await readFile(file, "utf8");
    await writeFileIfChanged(path, content, result, dryRun);
    result.installed[path] = hash(content);
  }
}

export async function prune(previousState, result, dryRun) {
  const keep = new Set(Object.keys(result.installed));
  for (const [path, previousHash] of Object.entries(previousState.installed)) {
    if (keep.has(path)) continue;
    let content;
    try {
      content = await readFile(path, "utf8");
    } catch {
      continue;
    }
    if (hash(content) !== previousHash) {
      result.conflicts.push(path);
      continue;
    }
    result.removed.push(path);
    if (!dryRun) await rm(path, { force: true });
  }
}

export async function loadState(target) {
  const statePath = join(target.skillsDir, STATE_FILE);
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return { version: 1, installed: {} };
  }
}

export async function saveState(target, state) {
  const statePath = join(target.skillsDir, STATE_FILE);
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
