import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const AGENT_FILE = "AGENT.md";
const SKILL_FILE = "SKILL.md";
const RECIPE_FILE = "RECIPE.md";
const MANIFEST_FILE = "manifest.json";
const RECIPE_MANIFEST_FILE = "recipe.json";

async function readManifest(directory, fileName) {
  try {
    const raw = await readFile(join(directory, fileName), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function readEntry(root, kind, fileName, bodyFile, manifestFile) {
  const directory = join(root, kind, fileName);
  const body = await readFile(join(directory, bodyFile), "utf8");
  const manifest = await readManifest(directory, manifestFile);
  return {
    id: fileName,
    kind,
    directory,
    manifest,
    body,
    purpose: typeof manifest.purpose === "string" ? manifest.purpose : "",
    riskLevel: typeof manifest.risk_level === "string" ? manifest.risk_level : "unknown",
    provenance: manifest.provenance ?? null,
  };
}

async function readKind(root, kind, bodyFile, manifestFile) {
  const names = await readdir(join(root, kind));
  const entries = await Promise.all(
    names
      .filter((name) => name !== "PROVENANCE.md" && name !== "README.md")
      .sort()
      .map(async (name) => readEntry(root, kind, name, bodyFile, manifestFile)),
  );
  return entries;
}

export async function readWorkforce(root) {
  const [agents, skills, recipes] = await Promise.all([
    readKind(root, "agents", AGENT_FILE, MANIFEST_FILE),
    readKind(root, "skills", SKILL_FILE, MANIFEST_FILE),
    readKind(root, "recipes", RECIPE_FILE, RECIPE_MANIFEST_FILE),
  ]);
  return { root, agents, skills, recipes };
}
