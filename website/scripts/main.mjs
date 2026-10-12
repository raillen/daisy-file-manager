import { dom } from "./config.mjs";
import { setHidden } from "./dom.mjs";
import { initializeLocale, onLocaleChange } from "./i18n.mjs";
import { applyTheme, initializeTheme, loadDesignTokens, toggleTheme } from "./theme.mjs";
import * as search from "./search.mjs";
import * as router from "./router.mjs";
import { collapseAll } from "./navigation.mjs";
import { errorCard } from "./markdown.mjs";
import { t } from "./i18n.mjs";

function wireSearch() {
  dom.search.addEventListener("input", (event) => {
    search.renderResults(dom.searchResults, event.target.value ?? "");
  });

  dom.search.addEventListener("wa-clear", () => {
    search.renderResults(dom.searchResults, "");
  });

  dom.search.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      search.moveSelection(dom.searchResults, 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      search.moveSelection(dom.searchResults, -1);
    } else if (event.key === "Enter" && search.activeIndex() >= 0) {
      const items = dom.searchResults.querySelectorAll(".search-result");
      items[search.activeIndex()]?.click();
    } else if (event.key === "Escape") {
      setHidden(dom.searchResults, true);
      search.resetSelection();
      dom.search.blur();
    }
  });

  dom.searchResults.addEventListener("click", (event) => {
    if (event.target.closest(".search-result") === null) return;
    setHidden(dom.searchResults, true);
    dom.search.value = "";
    search.resetSelection();
  });

  document.addEventListener("keydown", (event) => {
    const active = document.activeElement;
    const typing = active !== null && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
    if (event.key === "/" && active !== dom.search && !typing) {
      event.preventDefault();
      dom.search.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".search-wrap") !== null) return;
    setHidden(dom.searchResults, true);
    search.resetSelection();
  });
}

function wireTheme() {
  if (dom.themeToggle === null) return;
  dom.themeToggle.addEventListener("click", toggleTheme);
  window.addEventListener("theme-change", () => loadDesignTokens());
}

function wireNavigation() {
  if (dom.collapseAll !== null) {
    dom.collapseAll.addEventListener("click", () => collapseAll(dom.nav));
  }
  if (dom.menuToggle !== null) {
    dom.menuToggle.addEventListener("click", router.toggleMobileNavigation);
  }
  if (dom.sidebarBackdrop !== null) {
    dom.sidebarBackdrop.addEventListener("click", router.closeMobileNavigation);
  }
  window.addEventListener("close-nav", router.closeMobileNavigation);
}

async function start() {
  initializeTheme();
  await initializeLocale();
  onLocaleChange(() => {
    router.route();
  });

  wireSearch();
  wireTheme();
  wireNavigation();

  try {
    await loadDesignTokens();
    await router.bootstrap();

    const fuseCtor = await search.loadFuse();
    search.buildIndex(router.loadedManifest(), fuseCtor);
    router.route();
  } catch (error) {
    dom.content.innerHTML = errorCard(t("doc.bootstrapFailed"), error.message, t("doc.httpHint"));
  }
}

window.addEventListener("hashchange", router.route);
window.addEventListener("DOMContentLoaded", () => {
  start();
});