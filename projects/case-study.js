/* ==========================================================================
   Project case study renderer.
   Reads the JSON in <script type="application/json" id="project-data"> and
   builds the page. One template, one data block per project, nothing
   hard-coded in the HTML.

   Inline text supports the same shorthand as CONTENT.md:
     *text*   → accent green      **text** → bold
     `text`   → code
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
      .replace(/\*(.+?)\*/g, '<em class="accent">$1</em>')
      .replace(/`(.+?)`/g, "<code>$1</code>");
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

  function num(n) {
    return String(Math.round(n * 100) / 100);
  }

  /* -------------------------------------------------------------- charts */

  // Charts are inline SVG on a fixed 400 × 260 canvas that scales with its
  // column; colours come from CSS classes so they follow the page palette.
  var CW = 400;
  var CH = 260;
  var PLOT = { left: 40, right: 388, top: 18, bottom: 204 };

  function scale(v, max) {
    return PLOT.bottom - (v / max) * (PLOT.bottom - PLOT.top);
  }

  // A tidy axis maximum and tick step for values up to `max`.
  function axis(max) {
    var step = Math.pow(10, Math.floor(Math.log(max) / Math.LN10));
    if (max / step > 5) step *= 2;
    else if (max / step <= 2) step /= 2;
    return { max: Math.ceil(max / step) * step, step: step };
  }

  function grid(ax) {
    var out = "";
    for (var v = 0; v <= ax.max + 1e-9; v += ax.step) {
      var y = scale(v, ax.max).toFixed(1);
      out +=
        '<line class="ch-grid" x1="' + PLOT.left + '" x2="' + PLOT.right + '" y1="' + y + '" y2="' + y + '"/>' +
        '<text class="ch-tick" x="' + (PLOT.left - 8) + '" y="' + y + '" dy="3.5" text-anchor="end">' +
        num(v) + "</text>";
    }
    return out;
  }

  var CHART = {
    // Running total: each step adds (or removes) from the previous level;
    // "total" bars show the level so far, "final" bars an explicit value.
    waterfall: function (c) {
      var level = 0;
      var bars = (c.steps || []).map(function (st) {
        var from = level;
        var to;
        if (st.final) to = st.value;
        else if (st.total) to = level;
        else to = level + st.value;
        if (!st.final) level = to;
        return { st: st, lo: st.total || st.final ? 0 : Math.min(from, to), hi: st.total || st.final ? to : Math.max(from, to), to: to };
      });
      var ax = axis(Math.max.apply(null, bars.map(function (b) { return b.hi; })) * 1.12);
      var slot = (PLOT.right - PLOT.left) / bars.length;
      var bw = Math.min(46, slot * 0.62);
      var out = grid(ax);
      bars.forEach(function (b, i) {
        var st = b.st;
        var x = PLOT.left + slot * i + (slot - bw) / 2;
        var y1 = scale(b.hi, ax.max);
        var y0 = scale(b.lo, ax.max);
        var cls = st.final ? "ch-accent" : st.value < 0 ? "ch-neg" : st.total ? "ch-mute" : "ch-up";
        out += '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + bw.toFixed(1) +
          '" height="' + Math.max(1, y0 - y1).toFixed(1) + '"/>';
        // Connector to the next bar at the running level.
        if (i < bars.length - 1 && !st.final) {
          var ly = scale(b.to, ax.max).toFixed(1);
          out += '<line class="ch-link" x1="' + (x + bw).toFixed(1) + '" x2="' + (x + slot).toFixed(1) + '" y1="' + ly + '" y2="' + ly + '"/>';
        }
        var val = st.final || st.total ? num(b.to) : (st.value > 0 ? "+" : "−") + num(Math.abs(st.value));
        out += '<text class="ch-val' + (st.final ? " is-accent" : "") + '" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y1 - 6).toFixed(1) +
          '" text-anchor="middle">' + esc(val) + "</text>";
        out += '<text class="ch-label" x="' + (x + bw / 2).toFixed(1) + '" y="' + (PLOT.bottom + 18) + '" text-anchor="middle">' + esc(st.label) + "</text>";
        if (st.detail)
          out += '<text class="ch-detail" x="' + (x + bw / 2).toFixed(1) + '" y="' + (PLOT.bottom + 33) + '" text-anchor="middle">' + esc(st.detail) + "</text>";
      });
      return out;
    },

    line: function (c) {
      var xs = c.x || [];
      var ys = c.y || [];
      var xmax = xs[xs.length - 1] || 1;
      var ax = axis(Math.max.apply(null, ys) * 1.1);
      var px = function (v) { return PLOT.left + (v / xmax) * (PLOT.right - PLOT.left); };
      var pts = xs.map(function (v, i) { return px(v).toFixed(1) + "," + scale(ys[i], ax.max).toFixed(1); });
      var out = grid(ax);
      out += '<polygon class="ch-area" points="' + px(0).toFixed(1) + "," + PLOT.bottom + " " + pts.join(" ") + " " + px(xmax).toFixed(1) + "," + PLOT.bottom + '"/>';
      out += '<polyline class="ch-line" points="' + pts.join(" ") + '"/>';
      (c.xTicks || []).forEach(function (t) {
        out += '<text class="ch-label" x="' + px(t.at).toFixed(1) + '" y="' + (PLOT.bottom + 18) + '" text-anchor="middle">' + esc(t.label) + "</text>";
      });
      if (c.xLabel) out += '<text class="ch-detail" x="' + PLOT.right + '" y="' + (PLOT.bottom + 36) + '" text-anchor="end">' + esc(c.xLabel) + "</text>";
      if (c.marker) {
        var mx = px(c.marker.x);
        var my = scale(c.marker.y, ax.max);
        out += '<line class="ch-link" x1="' + mx.toFixed(1) + '" x2="' + mx.toFixed(1) + '" y1="' + my.toFixed(1) + '" y2="' + PLOT.bottom + '"/>' +
          '<circle class="ch-dot" cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="4"/>' +
          '<text class="ch-val is-accent" x="' + (mx + 9).toFixed(1) + '" y="' + (my - 8).toFixed(1) + '">' + esc(c.marker.label) + "</text>";
      }
      return out;
    },

    // Stacked bars, one series on top of the other, with a legend above.
    bars: function (c) {
      var cats = c.categories || [];
      var series = c.series || [];
      var totals = cats.map(function (_, i) {
        return series.reduce(function (t, s) { return t + (s.values[i] || 0); }, 0);
      });
      var ax = axis(Math.max.apply(null, totals) * 1.1);
      var slot = (PLOT.right - PLOT.left) / cats.length;
      var bw = Math.min(30, slot * 0.66);
      var out = grid(ax);
      cats.forEach(function (cat, i) {
        var x = PLOT.left + slot * i + (slot - bw) / 2;
        var base = 0;
        series.forEach(function (s) {
          var v = s.values[i] || 0;
          if (!v) return;
          var y1 = scale(base + v, ax.max);
          var y0 = scale(base, ax.max);
          out += '<rect class="' + (s.tone === "accent" ? "ch-accent" : "ch-mute") + '" x="' + x.toFixed(1) + '" y="' + y1.toFixed(1) +
            '" width="' + bw.toFixed(1) + '" height="' + (y0 - y1).toFixed(1) + '"/>';
          base += v;
        });
        out += '<text class="ch-label" x="' + (x + bw / 2).toFixed(1) + '" y="' + (PLOT.bottom + 18) + '" text-anchor="middle">' + esc(cat) + "</text>";
      });
      if (c.xLabel) out += '<text class="ch-detail" x="' + PLOT.right + '" y="' + (PLOT.bottom + 36) + '" text-anchor="end">' + esc(c.xLabel) + "</text>";
      return out;
    }
  };

  function chart(c) {
    var legend = (c.series || [])
      .map(function (s) {
        return '<span class="ch-key"><i class="' + (s.tone === "accent" ? "is-accent" : "") + '"></i>' + esc(s.name) + "</span>";
      })
      .join("");
    return (
      '<figure class="chart">' +
      (c.title ? '<figcaption class="chart-title">' + esc(c.title) + "</figcaption>" : "") +
      (legend ? '<div class="ch-legend">' + legend + "</div>" : "") +
      '<svg viewBox="0 0 ' + CW + " " + CH + '" role="img" aria-label="' + esc(c.alt || c.title) + '">' +
      (CHART[c.type] ? CHART[c.type](c) : "") +
      "</svg>" +
      (c.caption ? '<p class="chart-caption">' + inline(c.caption) + "</p>" : "") +
      "</figure>"
    );
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

    chart: function (s) {
      var list = s.charts || [];
      return (
        SECTION.prose(s) +
        '<div class="charts' + (list.length > 1 ? " is-pair" : "") + '">' + list.map(chart).join("") + "</div>" +
        (s.note ? '<p class="note">' + inline(s.note) + "</p>" : "")
      );
    },

    // Boxes in tiers joined by labelled arrows. Laid out left to right when
    // every tier gets enough width, otherwise top to bottom (see wireFlows).
    flow: function (s) {
      var tiers = s.tiers || [];
      var links = s.links || [];
      var out = "";
      tiers.forEach(function (t, i) {
        out +=
          '<div class="flow-tier">' +
          (t.label ? '<div class="flow-tier-label">' + esc(t.label) + "</div>" : "") +
          '<div class="flow-nodes">' +
          (t.nodes || [])
            .map(function (n) {
              return (
                '<div class="flow-node' + (n.tone ? " is-" + esc(n.tone) : "") + '"><h3>' + esc(n.title) + "</h3>" +
                (n.body ? "<p>" + inline(n.body) + "</p>" : "") +
                (n.tags ? tags(n.tags) : "") + "</div>"
              );
            })
            .join("") +
          "</div></div>";
        var l = links[i];
        if (i < tiers.length - 1) {
          l = l || {};
          out +=
            '<div class="flow-link' + (l.dir === "back" ? " is-back" : "") + '">' +
            '<span class="flow-arrow" aria-hidden="true"></span>' +
            '<span class="flow-link-text">' + (l.label ? '<span class="flow-link-label">' + inline(l.label) + "</span>" : "") +
            (l.back ? '<span class="flow-loop">↺ ' + inline(l.back) + "</span>" : "") + "</span></div>";
        }
      });
      return (
        SECTION.prose(s) +
        '<div class="flow" data-tiers="' + tiers.length + '" data-min="' + (s.minTierWidth || 170) + '" data-dir="col">' + out + "</div>" +
        (s.note ? '<p class="note">' + inline(s.note) + "</p>" : "")
      );
    },

    // Lanes with lifelines; each step is a message between two lanes or a
    // note on one lane.
    sequence: function (s) {
      var lanes = s.lanes || [];
      var n = lanes.length;
      var lines = lanes
        .map(function (_, i) {
          return '<span class="seq-life" style="left:' + ((i + 0.5) * 100 / n).toFixed(3) + '%"></span>';
        })
        .join("");
      var rows = (s.steps || [])
        .map(function (st) {
          if (st.at != null) {
            return (
              '<div class="seq-row"><div class="seq-note' + (st.tone ? " is-" + esc(st.tone) : "") + '" style="grid-column:' + (st.at + 1) + '">' +
              '<span class="seq-note-lane">' + esc(lanes[st.at]) + "</span>" + inline(st.text) + "</div></div>"
            );
          }
          var a = Math.min(st.from, st.to);
          var b = Math.max(st.from, st.to);
          return (
            '<div class="seq-row"><div class="seq-msg' + (st.to < st.from ? " is-left" : "") + '" style="grid-column:' + (a + 1) + " / " + (b + 2) +
            ";--span:" + (b - a + 1) + '"><span class="seq-label">' + inline(st.text) + '</span><span class="seq-arrow"></span></div></div>'
          );
        })
        .join("");
      return (
        SECTION.prose(s) +
        '<div class="seq" style="--lanes:' + n + '">' +
        '<div class="seq-head">' + lanes.map(function (l) { return '<div class="seq-lane">' + esc(l) + "</div>"; }).join("") + "</div>" +
        '<div class="seq-body">' + lines + rows + "</div></div>" +
        (s.note ? '<p class="note">' + inline(s.note) + "</p>" : "")
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
      'sandbox="allow-scripts allow-same-origin allow-forms" tabindex="-1"></iframe>' +
      (demo.poster ? '<img class="phone-poster" src="' + esc(demo.poster) + '" alt="" decoding="async">' : "") +
      "</div>" +
      '<div class="phone-layer layer-loading" data-layer="loading"><span class="loader"></span>Booting demo…</div>' +
      '<div class="phone-layer layer-missing" data-layer="missing" hidden><strong>' + esc(d.labels.missingTitle) +
      "</strong><span>" + esc(d.labels.missingBody) + "</span></div>" +
      '<button class="phone-layer layer-activate layer-start" type="button" data-layer="start" hidden>' +
      '<span class="activate-pill">' + esc(d.labels.start || "▶ Start demo") + "</span></button>" +
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
    wireFlows(root);
  }

  /* --------------------------------------------------------------- flows */

  function wireFlows(root) {
    var flows = Array.prototype.slice.call(root.querySelectorAll(".flow"));
    function layout() {
      flows.forEach(function (f) {
        // Measure the column, not the flow (the stacked layout caps its
        // width), and leave room for the 84px arrows between tiers.
        var n = Number(f.getAttribute("data-tiers"));
        var per = (f.parentElement.clientWidth - (n - 1) * 84) / n;
        f.setAttribute("data-dir", per >= Number(f.getAttribute("data-min")) ? "row" : "col");
      });
    }
    layout();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(layout);
      flows.forEach(function (f) { ro.observe(f.parentElement); });
    }
    window.addEventListener("resize", layout);
  }

  /* ---------------------------------------------------------------- demo */

  function wireDemo(win, demo, labels) {
    if (!win) return;
    var phone = win.querySelector(".phone");
    var iframe = win.querySelector("iframe");
    var status = win.querySelector("[data-status]");
    var poster = win.querySelector(".phone-poster");
    var layer = {
      loading: win.querySelector('[data-layer="loading"]'),
      missing: win.querySelector('[data-layer="missing"]'),
      start: win.querySelector('[data-layer="start"]'),
      activate: win.querySelector('[data-layer="activate"]')
    };
    // A demo with a poster waits for a tap: booting it shares the page's main
    // thread and would freeze scrolling for a second or more.
    var started = !poster;
    var w = demo.width || 390;
    var h = demo.height || 844;

    function setState(state) {
      win.setAttribute("data-state", state);
      layer.loading.hidden = state !== "loading";
      layer.missing.hidden = state !== "missing";
      layer.activate.hidden = state !== "ready";
      layer.start.hidden = state !== "poster";
      if (poster) poster.hidden = state === "ready" || state === "live";
      status.textContent =
        state === "poster" ? labels.statusPoster || demo.src :
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

    function activate() {
      setState("live");
      iframe.removeAttribute("tabindex");
      try { iframe.focus(); } catch (e) {}
    }

    iframe.addEventListener("load", function () {
      if (!iframe.getAttribute("src")) return;
      // The visitor already tapped Start, so don't ask for a second tap.
      if (poster) activate();
      else setState("ready");
    });

    layer.activate.addEventListener("click", activate);

    layer.start.addEventListener("click", function () {
      started = true;
      load();
    });

    win.querySelector("[data-reload]").addEventListener("click", function () {
      if (started) load();
    });

    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(win.parentElement);
    window.addEventListener("resize", fit);

    if (poster) {
      setState("poster");
      prefetch(demo.prefetch);
      return;
    }

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

  // Warm the HTTP cache for a tap-to-start demo once the page is idle, so the
  // tap only waits for the boot. Downloading doesn't block the main thread.
  function prefetch(urls) {
    if (!urls || !urls.length) return;
    var conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return;
    function go() {
      urls.forEach(function (u) {
        var l = document.createElement("link");
        l.rel = "prefetch";
        l.href = u;
        document.head.appendChild(l);
      });
    }
    function idle() {
      if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 4000 });
      else setTimeout(go, 1500);
    }
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle);
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
