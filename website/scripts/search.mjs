import { escapeHtml, sourceHeadings, stripMarkdown } from "./dom.mjs";
import { translate } from "./i18n.mjs";
import { cachedText } from "./loader.mjs";

let fuse = null;
let documents = [];
let keyboardIndex = -1;

function documentFor(path, title, domain, markdown) {
  return {
    path,
    title,
    domain,
    headings: sourceHeadings(markdown)
      .map((item) => item.title)
      .join(" "),
    content: stripMarkdown(markdown),
  };
}

function allDocuments(manifest) {
  const result = [documentFor("home.md", "Início", "Documentação", cachedText("home.md"))];
  for (const domain of manifest.domains) {
    for (const file of domain.files) {
      result.push(documentFor(file.path, file.title, domain.title, cachedText(file.path)));
    }
  }
  result.push(documentFor("about.md", "Sobre", "Projeto", cachedText("about.md")));
  return result;
}

export async function loadFuse() {
  try {
    const module = await import("https://cdn.jsdelivr.net/npm/fuse.js@7.5.0/dist/fuse.min.mjs");
    return module.default ?? module.Fuse ?? null;
  } catch (error) {
    console.warn("Fuse.js indisponível; usando busca textual de fallback.", error);
    return null;
  }
}

export function buildIndex(manifest, fuseCtor) {
  documents = allDocuments(manifest);
  fuse = fuseCtor === null ? null : new fuseCtor(documents, {
    keys: [
      { name: "title", weight: 0.38 },
      { name: "headings", weight: 0.3 },
      { name: "domain", weight: 0.12 },
      { name: "content", weight: 0.2 },
    ],
    threshold: 0.34,
    distance: 120,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

function excerptFor(item, query) {
  const text = item.content;
  if (text === "") return item.domain;
  const position = text.toLocaleLowerCase("pt-BR").indexOf(query.toLocaleLowerCase("pt-BR"));
  if (position >= 0) {
    const start = Math.max(0, position - 58);
    const end = Math.min(text.length, position + query.length + 105);
    return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
  }
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

function fallbackSearch(query) {
  const normalized = query.toLocaleLowerCase("pt-BR");
  return documents
    .filter((item) =>
      [item.title, item.domain, item.headings, item.content]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalized),
    )
    .slice(0, 10)
    .map((item) => ({ item }));
}

export function resultsFor(query) {
  return fuse === null ? fallbackSearch(query) : fuse.search(query, { limit: 10 });
}

function resetKeyboardSelection(resultsElement) {
  keyboardIndex = -1;
  for (const item of resultsElement.querySelectorAll(".search-result")) {
    item.classList.remove("is-keyboard-active");
  }
}

export function renderResults(resultsElement, query) {
  const clean = query.trim();
  if (clean.length < 2) {
    resultsElement.hidden = true;
    resultsElement.innerHTML = "";
    resetKeyboardSelection(resultsElement);
    return;
  }

  const results = resultsFor(clean);
  if (results.length === 0) {
    resultsElement.innerHTML =
      '<div class="search-empty">' +
      '<i class="ph ph-magnifying-glass" aria-hidden="true"></i> ' +
      escapeHtml(translate("search.noResults", { query: clean })) +
      "</div>";
    resultsElement.hidden = false;
    resetKeyboardSelection(resultsElement);
    return;
  }

  resultsElement.innerHTML = results
    .map(({ item }) =>
      '<a class="search-result" role="option" href="#/docs/' + escapeHtml(item.path) + '">' +
      '<span class="search-result-icon"><i class="ph ph-file-text" aria-hidden="true"></i></span>' +
      "<span>" +
      `<strong>${escapeHtml(item.title)}</strong>` +
      `<small>${escapeHtml(item.domain)} · ${escapeHtml(excerptFor(item, clean))}</small>` +
      "</span></a>")
    .join("");

  resultsElement.hidden = false;
  resetKeyboardSelection(resultsElement);
}

export function moveSelection(resultsElement, delta) {
  const items = Array.from(resultsElement.querySelectorAll(".search-result"));
  if (items.length === 0 || resultsElement.hidden) return;

  keyboardIndex = Math.max(0, Math.min(items.length - 1, keyboardIndex + delta));
  items.forEach((item, index) => {
    item.classList.toggle("is-keyboard-active", index === keyboardIndex);
  });
  items[keyboardIndex].scrollIntoView({ block: "nearest" });
}

export function activeIndex() {
  return keyboardIndex;
}

export function resetSelection() {
  keyboardIndex = -1;
}