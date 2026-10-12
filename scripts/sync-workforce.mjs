#!/usr/bin/env bun
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { GROUPS, parseGroups, selectEntries, summarize } from "./workforce/groups.mjs";
import { emptyResult, installAgent, installSkill, loadState, prune, saveState } from "./workforce/installer.mjs";
import { readWorkforce } from "./workforce/sources.mjs";
import { resolveTargets } from "./workforce/targets.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE = join(HERE, "..", ".agents", "workforce");
const DEFAULT_TARGETS = ["claude"];

function parseArgs(argv) {
  const options = {
    source: DEFAULT_SOURCE,
    targets: DEFAULT_TARGETS,
    groups: new Set(),
    dryRun: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--source=")) options.source = arg.slice("--source=".length);
    else if (arg.startsWith("--targets=")) options.targets = arg.slice("--targets=".length).split(",");
    else if (arg.startsWith("--groups=")) options.groups = parseGroups(arg.slice("--groups=".length));
    else if (arg === "--dry-run") options.dryRun = true;
    else throw new Error(`Argumento desconhecido: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    "uso: bun run scripts/sync-workforce.mjs [opções]",
    "",
    "  --source=<dir>      workforce vendorizado (padrão: .agents/workforce)",
    "  --targets=<lista>   claude,agents,opencode (padrão: claude)",
    "  --groups=<lista>    technical,design,accessibility,neurodivergence (padrão: todos)",
    "  --dry-run           mostra o plano sem escrever",
    "",
    "grupos disponíveis:",
    ...Object.entries(GROUPS).map(([id, label]) => `  ${id.padEnd(16)}${label}`),
  ].join("\n");
}

async function syncTarget(target, entries, dryRun) {
  const agents = entries.filter((entry) => entry.kind === "agents");
  const skills = entries.filter((entry) => entry.kind === "skills");
  const previous = await loadState(target);
  const result = emptyResult();

  for (const entry of agents) await installAgent(entry, target, result, dryRun);
  for (const entry of skills) await installSkill(entry, target, result, dryRun);
  await prune(target, previous, result, dryRun);
  if (!dryRun) await saveState(target, { version: 1, installed: result.installed });

  return result;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(usage());
    return;
  }

  const options = parseArgs(argv);
  const targets = resolveTargets(options.targets);
  const workforce = await readWorkforce(options.source);

  const selected = [
    ...selectEntries(workforce.agents, options.groups),
    ...selectEntries(workforce.skills, options.groups),
  ];
  const counts = summarize(selected);
  console.log(
    `workforce: ${workforce.agents.length} agentes · ${workforce.skills.length} skills · ${workforce.recipes.length} receitas`,
  );
  console.log(
    `selecionado: ${selected.length} (${Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ")})`,
  );

  for (const target of targets) {
    const result = await syncTarget(target, selected, options.dryRun);
    const prefix = options.dryRun ? "[dry-run] " : "";
    console.log(
      `${prefix}${target.label}: ${result.written.length} escritos · ${result.removed.length} removidos · ${result.conflicts.length} conflitantes`,
    );
    for (const conflict of result.conflicts) {
      console.log(`  conflito (modificado localmente, mantido): ${conflict}`);
    }
  }
}

await main();