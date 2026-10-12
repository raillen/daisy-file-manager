import { escapeHtml, setHidden } from "./dom.mjs";

function markedInstance() {
  return window.marked ?? null;
}

export function renderMarkdown(markdown) {
  const marked = markedInstance();
  if (marked === null) {
    throw new Error("Marked não foi carregado pelo CDN.");
  }
  return marked.parse(markdown, { gfm: true, breaks: false });
}

export function requireMarked() {
  if (markedInstance() === null) {
    throw new Error("Marked não foi carregado pelo CDN.");
  }
}

function assignHeadingIds(root) {
  const used = new Map();
  root.querySelectorAll("h1, h2, h3").forEach((heading) => {
    const cleanTitle = heading.textContent.trim();
    const base = cleanTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "secao";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    heading.id = count === 0 ? base : `${base}-${count + 1}`;
    heading.dataset.cleanTitle = cleanTitle;
  });
}

function addHeadingAnchors(root, currentPath, labelFor) {
  root.querySelectorAll("h2, h3").forEach((heading) => {
    const anchor = document.createElement("a");
    anchor.className = "heading-anchor";
    anchor.href = `#/docs/${currentPath}#${heading.id}`;
    anchor.setAttribute("aria-label", labelFor(heading.dataset.cleanTitle));
    anchor.innerHTML = '<i class="ph ph-link" aria-hidden="true"></i>';
    heading.append(anchor);
  });
}

function wrapTables(root) {
  root.querySelectorAll("table").forEach((table) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.append(table);
  });
}

function addCopyButtons(root, labels) {
  root.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (code === null) return;

    const button = document.createElement("button");
    button.className = "code-copy";
    button.type = "button";
    button.setAttribute("aria-label", labels.copyCode);
    button.innerHTML = '<i class="ph ph-copy" aria-hidden="true"></i>';

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent ?? "");
        button.innerHTML = '<i class="ph ph-check" aria-hidden="true"></i>';
        button.setAttribute("aria-label", labels.copied);
        setTimeout(() => {
          button.innerHTML = '<i class="ph ph-copy" aria-hidden="true"></i>';
          button.setAttribute("aria-label", labels.copyCode);
        }, 1300);
      } catch {
        button.setAttribute("aria-label", labels.failed);
      }
    });

    pre.append(button);
  });
}

function rewriteInternalLinks(root, knownPaths, currentPath) {
  root.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (href === "" || href.startsWith("#/docs/")) return;
    if (/^(https?:|mailto:|tel:|\/\/)/i.test(href)) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("/")) return;

    const match = /^(.*?)(?:#([^#]*))?$/.exec(href);
    if (match === null) return;
    const target = match[1];
    if (target !== "" && !/\.md$/i.test(target)) return;

    const resolved = target === "" ? currentPath : target;
    if (!knownPaths.has(resolved)) return;
    const anchor = match[2] === undefined ? "" : `#${encodeURIComponent(match[2])}`;
    link.href = `#/docs/${resolved}${anchor}`;
  });

  root.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.target = "_blank";
    link.rel = "noreferrer";
  });
}

export function enhanceContent(root, { currentPath, knownPaths, labels }) {
  assignHeadingIds(root);
  addHeadingAnchors(root, currentPath, (title) => labels.anchor(title));
  wrapTables(root);
  addCopyButtons(root, {
    copyCode: labels.copyCode,
    copied: labels.copied,
    failed: labels.failed,
  });
  rewriteInternalLinks(root, knownPaths, currentPath);
}

export function errorCard(title, message, hint) {
  return (
    '<div class="error-card" role="alert">' +
    `<strong>${escapeHtml(title)}</strong>` +
    `<p>${escapeHtml(message)}</p>` +
    (hint === undefined ? "" : `<p>${escapeHtml(hint)}</p>`) +
    "</div>"
  );
}

export function buildTable(rows) {
  const header = `<tr>${rows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr>`;
  const body = rows
    .slice(1)
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<div class="table-scroll"><table>${header}${body}</table></div>`;
}