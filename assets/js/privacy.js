/* Light/dark toggle for the privacy and deletion pages. The saved choice is
   applied by an inline script in <head>; this only wires the button, which
   stays hidden without JavaScript. Shares its key with the case studies. */
(function () {
  "use strict";

  var THEME_KEY = "cs-theme";

  function storageSet(k, v) {
    try {
      if (v == null) window.localStorage.removeItem(k);
      else window.localStorage.setItem(k, v);
    } catch (e) {}
  }

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || systemTheme();
  }

  var btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  function label() {
    // Name the theme you'd switch *to*.
    var next = currentTheme() === "dark" ? "light" : "dark";
    btn.textContent = next === "light" ? "◐ Light" : "◑ Dark";
    btn.setAttribute("aria-label", "Switch to " + next + " mode");
  }

  btn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    // Picking the system's own theme clears the override.
    var value = next === systemTheme() ? null : next;
    if (value) document.documentElement.setAttribute("data-theme", value);
    else document.documentElement.removeAttribute("data-theme");
    storageSet(THEME_KEY, value);
    label();
  });

  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(label);
  }

  label();
  btn.hidden = false;
})();
