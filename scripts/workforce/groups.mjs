export const GROUPS = {
  technical: "Técnico (engenharia, arquitetura, qualidade, segurança)",
  design: "Design e UI/UX",
  accessibility: "Acessibilidade",
  neurodivergence: "Neurodivergência",
};

const designAgents = new Set([
  "advertising-designer",
  "brand-designer",
  "creative-director",
  "design-researcher",
  "design-system-engineer",
  "frontend-engineer",
  "motion-designer",
  "prototyper",
  "svg-artist",
  "ui-component-engineer",
  "ux-architect",
  "visual-identity-auditor",
]);

const accessibilityAgents = new Set(["accessibility-reviewer"]);

const designSkills = new Set([
  "aesthetic-analysis",
  "asset-reference-research",
  "brand-identity",
  "color-science",
  "component-specification",
  "design-critique",
  "design-psychology",
  "design-research",
  "design-system",
  "design-tokens",
  "generative-svg-art",
  "icon-system",
  "information-architecture",
  "interaction-design",
  "interaction-research",
  "layout-patterns",
  "motion-library",
  "prototyping",
  "responsive-design",
  "typography-system",
  "ui-implementation",
  "ui-ux-review",
  "user-flows",
  "visual-communication",
  "visual-qa",
  "visual-reference-research",
  "visual-regression",
  "wireframe-styleguide",
  "wireframing",
  "svg-engineering",
]);

const accessibilitySkills = new Set([
  "accessibility",
  "contrast",
  "focus-management",
  "game-ui-testing",
  "keyboard-accessibility",
  "motion-accessibility",
  "playwright-ui",
  "screen-reader",
  "zoom-reflow",
]);

const neurodivergenceSkills = new Set(["cognitive-clarity"]);

function groupForAgent(name) {
  const groups = [];
  if (designAgents.has(name)) groups.push("design");
  if (accessibilityAgents.has(name)) groups.push("accessibility");
  return groups.length > 0 ? groups : ["technical"];
}

function groupForSkill(name) {
  const groups = [];
  if (designSkills.has(name)) groups.push("design");
  if (accessibilitySkills.has(name)) groups.push("accessibility");
  if (neurodivergenceSkills.has(name)) groups.push("neurodivergence");
  return groups.length > 0 ? groups : ["technical"];
}

export function groupsOf(entry) {
  return entry.kind === "agents" ? groupForAgent(entry.id) : groupForSkill(entry.id);
}

export function selectEntries(entries, requested) {
  if (requested.size === 0) return entries;
  return entries.filter((entry) => groupsOf(entry).some((group) => requested.has(group)));
}

export function parseGroups(raw) {
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

export function summarize(entries) {
  const counts = { technical: 0, design: 0, accessibility: 0, neurodivergence: 0 };
  for (const entry of entries) {
    for (const group of groupsOf(entry)) {
      counts[group] += 1;
    }
  }
  return counts;
}
