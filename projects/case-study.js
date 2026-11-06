/* ==========================================================================
   Project case study renderer.
   Reads the JSON in <script type="application/json" id="project-data"> and
   builds the page. One template, one data block per project, nothing
   hard-coded in the HTML.

   Inline text supports the same shorthand as CONTENT.md:
     *text*   → accent green      **text** → bold
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, '<em class="accent">$1</em>');
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function tags(list) {
    return (
      '<div class="tags">' +
      (list || [])
        .map(function (t) {
          return '<span class="tag">' + esc(t) + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function paras(list) {
    return (list || [])
      .map(function (p) {
        return "<p>" + inline(p) + "</p>";
      })
      .join("");
  }

  /* ------------------------------------------------------------ sections */

  var SECTION = {
    prose: function (s) {
      return (
        (s.lead ? '<p class="sec-lead">' + inline(s.lead) + "</p>" : "") +
        '<div class="prose">' + paras(s.body) + "</div>"
      );
    },

    steps: function (s) {
      return (
        SECTION.prose(s) +
        '<div class="cards">' +
        (s.items || [])
          .map(function (it, i) {
            return (
              '<article class="card"><div class="card-num">' +
              pad(i + 1) +
              "</div><h3>" + esc(it.title) + "</h3><p>" + inline(it.body) +
              "</p></article>"
            );
          })
          .join("") +
        "</div>"
      );
    },

    formula: function (s) {
      var code = (s.code || [])
        .map(function (line) {
          var e = esc(line);
          if (/^\s*(\/\/|#)/.test(line)) return '<span class="c">' + e + "</span>";
          return e.replace(/^(\s*[\w ]+?)(\s*=)/, '<span class="k">$1</span>$2');
        })
        .join("\n");
      return (
        SECTION.prose(s) +
        '<pre class="terminal" aria-label="' + esc(s.codeLabel || "Formula") + '">' +
        code + "</pre>" +
        (s.note ? '<p class="note">' + inline(s.note) + "</p>" : "")
      );
    },

    layers: function (s) {
      return (
        SECTION.prose(s) +
        '<div class="layers">' +
        (s.items || [])
          .map(function (it) {
            return (
              '<div class="layer"><div class="layer-label">' + esc(it.label) +
              '</div><div class="layer-body">' + tags(it.tags) +
              (it.body ? "<p>" + inline(it.body) + "</p>" : "") +
              "</div></div>"
            );
          })
          .join("") +
        "</div>"
      );
    },

    decisions: function (s) {
      return (
        SECTION.prose(s) +
        '<div class="decisions">' +
        (s.items || [])
          .map(function (it) {
            return (
              '<article class="decision"><h3>' + esc(it.title) + "</h3><dl>" +
              "<dt>Why</dt><dd>" + inline(it.why) + "</dd>" +
              "<dt>Trade-off</dt><dd>" + inline(it.tradeoff) + "</dd>" +
              "</dl></article>"
            );
          })
          .join("") +
        "</div>"
      );
    }
  };

  /* ---------------------------------------------------------------- page */

  function render(d) {
    var site = d.site || {};
    var demo = d.demo || {};
    // "device": "desktop" frames a wide app in a thin window above the
    // at-a-glance panel instead of a phone beside it.
    var desktop = demo.device === "desktop";
    var total = (d.sections || []).length;

    document.title = d.title + " · " + (site.name || "Case study");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", d.title + ": " + d.tagline);

    var header =
      '<header class="cs-header"><div class="wrap">' +
      '<a class="back-link" href="' + esc(site.backHref) + '">' + esc(site.backLabel) + "</a>" +
      '<div class="eyebrow"><span class="eyebrow-rule"></span>' +
      '<span class="eyebrow-text">' + esc(d.number) + " · " + esc(d.kicker) + "</span></div>" +
      '<h1 class="cs-title">' + esc(d.title) + "</h1>" +
      '<p class="cs-tagline">' + inline(d.tagline) + "</p>" +
      tags(d.stack) +
      "</div></header>";

    var facts = (d.facts || [])
      .map(function (f) {
        return '<div class="fact"><dt>' + esc(f.label) + "</dt><dd>" + inline(f.value) + "</dd></div>";
      })
      .join("");

    var highlights = (d.highlights || [])
      .map(function (h) {
        return "<li><span>" + inline(h) + "</span></li>";
      })
      .join("");

    var hero =
      '<section class="cs-hero" aria-label="Live demo"><div class="wrap"><div class="hero-grid' + (desktop ? " is-desktop" : "") + '">' +
      '<div class="demo-window" data-state="loading">' +
      '<div class="demo-bar"><span class="demo-status"><span class="demo-status-dot"></span>' +
      '<span class="demo-path" data-status>' + esc(demo.src) + "</span></span>" +
      '<span class="demo-tools"><button class="icon-btn" type="button" data-reload aria-label="Reload demo">↻ Reload</button></span></div>' +
      '<div class="phone' + (desktop ? " is-desktop" : "") + '" style="--w:' + (demo.width || 390) + "px;--h:" + (demo.height || 844) + 'px">' +
      '<div class="phone-viewport">' +
      '<div class="phone-screen"><iframe title="' + esc(d.title) + ' live demo" loading="lazy" ' +
      'sandbox="allow-scripts allow-same-origin allow-forms" tabindex="-1"></iframe></div>' +
      '<div class="phone-layer layer-loading" data-layer="loading"><span class="loader"></span>Booting demo…</div>' +
      '<div class="phone-layer layer-missing" data-layer="missing" hidden><strong>' + esc(d.labels.missingTitle) +
      "</strong><span>" + esc(d.labels.missingBody) + "</span></div>" +
      '<button class="phone-layer layer-activate" type="button" data-layer="activate" hidden>' +
      '<span class="activate-pill">' + esc(d.labels.activate) + "</span></button>" +
      "</div></div>" +
      (demo.caption ? '<p class="demo-caption">' + inline(demo.caption) + "</p>" : "") +
      "</div>" +
      '<div class="glance"><h2 class="glance-title">' + esc(d.labels.glance) + '</h2><span class="rule"></span>' +
      (d.summary ? '<p class="glance-lead">' + inline(d.summary) + "</p>" : "") +
      '<dl class="facts">' + facts + "</dl>" +
      (highlights ? '<ul class="highlights">' + highlights + "</ul>" : "") +
      "</div></div></div></section>";

    var sections = (d.sections || [])
      .map(function (s, i) {
        var id = "s-" + (s.id || i + 1);
        var kind = SECTION[s.kind] ? s.kind : "prose";
        return (
          '<section class="cs-section" id="' + esc(id) + '" aria-labelledby="' + esc(id) + '-t">' +
          '<div class="wrap split"><div class="sec-side">' +
          '<div class="sec-num">' + pad(i + 1) + " <span>/ " + pad(total) + "</span></div>" +
          '<h2 class="sec-title" id="' + esc(id) + '-t">' + esc(s.title) + "</h2>" +
          '<span class="rule"></span></div>' +
          "<div>" + SECTION[kind](s) + "</div></div></section>"
        );
      })
      .join("");

    var root = document.getElementById("case-study");
    root.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<div class="scanlines" aria-hidden="true"></div>' +
      '<div class="topbar"><div class="topbar-inner">' +
      '<a class="brand" href="' + esc(site.homeHref) + '">' + esc(site.name) + "</a>" +
      "</div></div>" +
      '<main id="main">' + header + hero + sections + "</main>" +
      '<footer class="footer"><div class="footer-inner"><span>© ' + new Date().getFullYear() + " " +
      esc(site.name) + "</span><span>" + esc(d.title) + " · " + esc(d.labels.footer) + "</span></div></footer>";

    wireDemo(root.querySelector(".demo-window"), demo, d.labels);
  }

  /* ---------------------------------------------------------------- demo */

  function wireDemo(win, demo, labels) {
    if (!win) return;
    var phone = win.querySelector(".phone");
    var iframe = win.querySelector("iframe");
    var status = win.querySelector("[data-status]");
    var layer = {
      loading: win.querySelector('[data-layer="loading"]'),
      missing: win.querySelector('[data-layer="missing"]'),
      activate: win.querySelector('[data-layer="activate"]')
    };
    var w = demo.width || 390;
    var h = demo.height || 844;

    function setState(state) {
      win.setAttribute("data-state", state);
      layer.loading.hidden = state !== "loading";
      layer.missing.hidden = state !== "missing";
      layer.activate.hidden = state !== "ready";
      status.textContent =
        state === "missing" ? labels.statusMissing :
        state === "loading" ? labels.statusLoading :
        state === "live" ? labels.statusLive : demo.src;
    }

    // Fit the phone: never wider than the column, never taller than the
    // desktop cap; 1:1 only if there's room for it.
    function fit() {
      var desktop = demo.device === "desktop";
      var bezel = desktop ? 14 : 22; // 2 × bezel + 2 × 1px border
      var avail = win.parentElement.clientWidth || w;
      var maxH = Math.min(demo.maxHeight || 560, window.innerHeight * 0.78);
      var s = Math.min(1, (avail - bezel) / w, (maxH - bezel) / h);
      phone.style.setProperty("--scale", Math.max(desktop ? 0.2 : 0.4, s).toFixed(4));
    }

    function load() {
      setState("loading");
      iframe.setAttribute("tabindex", "-1");
      iframe.removeAttribute("src");
      // Check the demo exists before pointing the iframe at it, so a missing
      // build shows a clear state instead of the host's 404 page.
      var probe =
        location.protocol === "file:" || !window.fetch
          ? Promise.resolve(true)
          : fetch(demo.src, { method: "HEAD", cache: "no-store" })
              .then(function (r) { return r.ok; })
              .catch(function () { return true; });
      probe.then(function (ok) {
        if (!ok) return setState("missing");
        iframe.src = demo.src;
      });
    }

    iframe.addEventListener("load", function () {
      if (!iframe.getAttribute("src")) return;
      setState("ready");
    });

    layer.activate.addEventListener("click", function () {
      layer.activate.hidden = true;
      iframe.removeAttribute("tabindex");
      win.setAttribute("data-state", "ready");
      status.textContent = labels.statusLive;
      try { iframe.focus(); } catch (e) {}
    });

    win.querySelector("[data-reload]").addEventListener("click", load);

    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(win.parentElement);
    window.addEventListener("resize", fit);

    // Only start the iframe once the hero is near the viewport.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          io.disconnect();
          load();
        }
      }, { rootMargin: "200px" });
      io.observe(win);
    } else {
      load();
    }
  }

  /* ---------------------------------------------------------------- boot */

  function boot() {
    var node = document.getElementById("project-data");
    try {
      render(JSON.parse(node.textContent));
    } catch (e) {
      document.getElementById("case-study").innerHTML =
        '<div class="load-error"><h1>Case study unavailable</h1><p>' + esc(e.message) + "</p></div>";
      if (window.console) console.error(e);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
