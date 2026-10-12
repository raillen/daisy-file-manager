import { config, dom } from "./config.mjs";
import { escapeHtml, setHidden } from "./dom.mjs";
import { t, translate } from "./i18n.mjs";
import { preload } from "./loader.mjs";
import { enhanceContent, errorCard, renderMarkdown, requireMarked } from "./markdown.mjs";
import { buildNavigation, setActivePath, setActiveTopic } from "./navigation.mjs";
import { phosphorIcon } from "./theme.mjs";

let manifest = null;
let currentPath = null;
let tocObserver = null;
let routeToken = 0;

export function knownPaths() {
  return new Set([
    "home.md",
    "about.md",
    ...manifest.domains.flatMap((domain) => domain.files.map((file) => file.path)),
  ]);
}

export function allPaths() {
  return [
    "home.md",
    "about.md",
    ...manifest.domains.flatMap((domain) => domain.files.map((file) => file.path)),
  ];
}

function fileMeta(path) {
  for (const domain of manifest.domains) {
    const file = domain.files.find((candidate) => candidate.path === path);
    if (file !== undefined) return { domain, file };
  }
  if (path === "home.md") return { domain: { id: "home", title: t("doc.documentation") }, file: { title: t("doc.home"), path } };
  if (path === "about.md") return { domain: { id: "project", title: "Projeto" }, file: { title: t("doc.about"), path } };
  return null;
}

function buildPageToc(path) {
  const headings = Array.from(dom.content.querySelectorAll(".markdown-body h2, .markdown-body h3"));

  dom.pageToc.innerHTML = headings
    .map((heading) => {
      const level = heading.tagName === "H2" ? 2 : 3;
      const label = heading.dataset.cleanTitle ?? heading.textContent.trim();
      return (
        `<a data-level="${level}" data-topic="${escapeHtml(heading.id)}" href="#/docs/${path}#${escapeHtml(heading.id)}">` +
        escapeHtml(label) +
        "</a>"
      );
    })
    .join("");

  if (tocObserver !== null) tocObserver.disconnect();

  tocObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveTopic(dom.nav, dom.pageToc, path, visible[0].target.id);
    },
    { rootMargin: "-88px 0px -68% 0px", threshold: 0 },
  );

  for (const heading of headings) tocObserver.observe(heading);
}

export async function openDoc(path, anchor, token) {
  try {
    requireMarked();
    currentPath = path;
    const markdown = await import("./loader.mjs").then((module) => module.loadText(path));
    if (token !== routeToken) return;

    const meta = fileMeta(path);
    dom.content.innerHTML =
      '<div class="doc-context">' +
      `<i class="${phosphorIcon("nav.breadcrumb")}" aria-hidden="true"></i>` +
      `<span>${escapeHtml(meta === null ? t("doc.documentation") : meta.domain.title)}</span>` +
      "</div>" +
      `<article class="markdown-body">${renderMarkdown(markdown)}</article>`;

    enhanceContent(dom.content, {
      currentPath: path,
      knownPaths: knownPaths(),
      labels: {
        copyCode: t("doc.copyCode"),
        copied: t("doc.codeCopied"),
        failed: t("doc.copyFailed"),
        anchor: (title) => translate("doc.anchorLabel", { title }),
      },
    });

    buildPageToc(path);
    setActivePath(dom.nav, path);
    document.title = `${meta === null ? t("doc.documentation") : meta.file.title} — daisy`;

    if (anchor !== undefined) {
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        if (target !== null) target.scrollIntoView({ block: "start" });
        setActiveTopic(dom.nav, dom.pageToc, path, anchor);
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    dom.content.focus({ preventScroll: true });
    closeMobileNavigation();
  } catch (error) {
    if (token !== routeToken) return;
    dom.content.innerHTML = errorCard(t("doc.loading"), error.message, t("doc.httpHint"));
  }
}

export function route() {
  if (manifest === null) return;

  const token = ++routeToken;
  const raw = location.hash === "" ? config.defaultRoute : location.hash;
  const match = /^#\/docs\/([^#]+)(?:#(.+))?$/.exec(raw);

  for (const link of document.querySelectorAll(".topnav a")) {
    const active = link.hash === raw.split("#").slice(0, 2).join("#");
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }

  if (match === null) {
    openDoc("home.md", undefined, token);
    return;
  }

  openDoc(match[1], match[2], token);
}

export function closeMobileNavigation() {
  if (dom.sidebar === null) return;
  dom.sidebar.classList.remove("is-open");
  setHidden(dom.sidebarBackdrop, true);
  if (dom.menuToggle !== null) dom.menuToggle.setAttribute("aria-expanded", "false");
}

export function toggleMobileNavigation() {
  if (dom.sidebar === null) return;
  const open = !dom.sidebar.classList.contains("is-open");
  dom.sidebar.classList.toggle("is-open", open);
  setHidden(dom.sidebarBackdrop, !open);
  if (dom.menuToggle !== null) dom.menuToggle.setAttribute("aria-expanded", String(open));
}

export async function bootstrap() {
  const response = await fetch(config.manifestUrl, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(t("doc.manifestMissing"));
  }
  manifest = await response.json();

  await preload(allPaths());
  await buildNavigation(dom.nav, manifest);
}

export function currentRoutePath() {
  return currentPath;
}

export function loadedManifest() {
  return manifest;
}