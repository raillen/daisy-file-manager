import { homedir } from "node:os";
import { join, resolve } from "node:path";

const home = homedir();

function opencodeRoot() {
  const override = process.env.OPENCODE_CONFIG_DIR;
  return resolve(override ?? join(home, ".config", "opencode"));
}

export const TARGETS = {
  claude: {
    id: "claude",
    label: "Claude Code",
    agentsDir: join(home, ".claude", "agents"),
    skillsDir: join(home, ".claude", "skills"),
  },
  agents: {
    id: "agents",
    label: "Agents compartilhado",
    agentsDir: join(home, ".agents", "agents"),
    skillsDir: join(home, ".agents", "skills"),
  },
  opencode: {
    id: "opencode",
    label: "OpenCode",
    agentsDir: join(opencodeRoot(), "agent"),
    skillsDir: join(opencodeRoot(), "skills"),
  },
};

export function resolveTargets(ids) {
  return ids.map((id) => {
    const target = TARGETS[id];
    if (target === undefined) {
      throw new Error(`Alvo desconhecido: ${id}. Disponíveis: ${Object.keys(TARGETS).join(", ")}`);
    }
    return target;
  });
}

export const STATE_FILE = ".daisy-workforce.json";
