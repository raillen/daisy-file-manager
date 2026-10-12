import { escapeHtml, sourceHeadings } from "./dom.mjs";
import { t } from "./i18n.mjs";
import { loadText } from "./loader.mjs";

const DOMAIN_ICONS = {
  guide: "ph-compass",
  usage: "ph-keyboard",
  architecture: "ph-cube",
  design: "ph-palette",
  quality: "ph-shield-check",
  roadmap: "ph-flag-checkered",
};

function iconForDomain(domainId) {
  return DOMAIN_ICONS[domainId] ?? "ph-folder";
}

function homeLink(manifest) {
  const link = document.createElement("a");
  link.className = "nav-home file-overview";
  link.href = "#/docs/home.md";
  link.dataset.path = "home.md";
  link.innerHTML =
    '<i class="ph ph-house" aria-hidden="true"></i>' +
    `<span>${escapeHtml(t("doc.home"))}</span>`;
  return link;
}

function aboutLink() {
  const link = document.createElement("a");
  link.className = "nav-home file-overview";
  link.href = "#/docs/about.md";
  link.dataset.path = "about.md";
  link.innerHTML =
    '<i class="ph ph-info" aria-hidden="true"></i>' +
    `<span>${escapeHtml(t("doc.about"))}</span>`;
  return link;
}

function fileSection(file, markdown) {
  const details = document.createElement("details");
  details.className = "nav-file";

  const summary = document.createElement("summary");
  summary.innerHTML =
    '<i class="ph ph-caret-right nav-caret" aria-hidden="true"></i>' +
    `<span class="nav-file-title">${escapeHtml(file.title)}</span>`;

  const children = document.createElement("div");
  children.className = "nav-file-children";

  const overview = document.createElement("a");
  overview.className = "file-overview";
  overview.href = `#/docs/${file.path}`;
  overview.dataset.path = file.path;
  overview.textContent = t("doc.overview");
  children.append(overview);

  for (const heading of sourceHeadings(markdown).filter((item) => item.level === 2)) {
    const link = document.createElement("a");
    link.className = "topic-link";
    link.href = `#/docs/${file.path}#${heading.id}`;
    link.dataset.path = file.path;
    link.dataset.topic = heading.id;
    link.textContent = heading.title;
    children.append(link);
  }

  details.append(summary, children);
  return details;
}

function domainSection(domain, files) {
  const details = document.createElement("details");
  details.className = "nav-domain";
  details.open = false;

  const summary = document.createElement("summary");
  summary.innerHTML =
    `<i class="ph ${iconForDomain(domain.id)} nav-domain-icon" aria-hidden="true"></i>` +
    `<span>${escapeHtml(domain.title)}</span>` +
    '<i class="ph ph-caret-right nav-caret" aria-hidden="true"></i>';

  const children = document.createElement("div");
  children.className = "nav-domain-children";
  for (const { file, markdown } of files) {
    children.append(fileSection(file, markdown));
  }

  details.append(summary, children);
  return details;
}

export async function buildNavigation(navElement, manifest) {
  navElement.innerHTML = "";
  navElement.append(homeLink(manifest));

  for (const domain of manifest.domains) {
    const files = await Promise.all(
      domain.files.map(async (file) => ({ file, markdown: await loadText(file.path) })),
    );
    navElement.append(domainSection(domain, files));
  }

  navElement.append(aboutLink());
}

export function collapseAll(navElement) {
  navElement.querySelectorAll("details").forEach((details) => {
    details.open = false;
  });
}

export function setActivePath(navElement, path) {
  for (const link of navElement.querySelectorAll(".file-overview")) {
    const active = link.dataset.path === path;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
      for (const ancestor of [link.closest(".nav-file"), link.closest(".nav-domain")]) {
        if (ancestor !== null) ancestor.open = true;
      }
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

export function setActiveTopic(navElement, pageToc, path, topicId) {
  for (const link of navElement.querySelectorAll(".topic-link")) {
    link.classList.toggle("active", link.dataset.path === path && link.dataset.topic === topicId);
  }
  for (const link of pageToc.querySelectorAll("a")) {
    link.classList.toggle("active", link.dataset.topic === topicId);
  }
}