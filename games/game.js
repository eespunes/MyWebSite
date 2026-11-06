/* ==========================================================================
   Game page renderer, shared by every games/<slug>/index.html.
   Reads CONTENT.md (## Games and its subs) with the same parser as the home
   page and builds one game's page from it.

   Every build is served from this site; a row without a Source isn't
   listed. A Web build plays in the page once games/<slug>/build/index.html
   is present; until then the game features its first download instead.
   ========================================================================== */
(function () {
  "use strict";

  var ROOT = "../../";
  var ORDER = ["web", "windows", "macos", "linux", "android"];

  /* ------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* CONTENT.md shorthand: **bold**, *accent*, `code`. */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, '<em class="accent">$1</em>');
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function slugOf(link) {
    return String(link || "").replace(/\/+$/, "").split("/").pop();
  }

  function sub(section, title) {
    return CVParse.byTitle(section ? section.subs : [], title) || { fields: {}, tables: [], subs: [], bullets: [], paragraphs: [] };
  }

  function isUrl(s) {
    return /^https?:\/\//.test(s || "");
  }

  /* Site-relative paths in CONTENT.md, seen from games/<slug>/. */
  function href(s) {
    return isUrl(s) ? s : ROOT + String(s || "").replace(/^\/+/, "");
  }

  var ICONS = {
    web: '<circle cx="8" cy="8" r="6.25"/><path d="M1.75 8h12.5M8 1.75c2.2 2.4 2.2 10.1 0 12.5M8 1.75c-2.2 2.4-2.2 10.1 0 12.5"/>',
    desktop: '<rect x="1.75" y="2.5" width="12.5" height="8.75" rx="1"/><path d="M5.5 14h5M8 11.25V14"/>',
    android: '<rect x="4.5" y="1.5" width="7" height="13" rx="1.5"/><path d="M7 12.25h2"/>',
  };

  function icon(platform) {
    var key = platform === "web" ? "web" : platform === "android" ? "android" : "desktop";
    return '<svg class="pill-icon" viewBox="0 0 16 16" aria-hidden="true">' + ICONS[key] + "</svg>";
  }

  function pill(platform, name) {
    return '<span class="pill mono">' + icon(platform) + esc(name) + "</span>";
  }

  function external(url, label, cls) {
    return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
      inline(label) + ' <span aria-hidden="true">↗</span></a>';
  }

  /* "W / S: Left paddle · ↑ / ↓: Right paddle" → [{ keys: [W, S], action }] */
  function controls(value) {
    return String(value || "")
      .split(" · ")
      .map(function (pair) {
        var at = pair.indexOf(": ");
        if (at < 0) return null;
        return {
          keys: pair.slice(0, at).split(" / ").map(function (k) { return k.trim(); }),
          action: pair.slice(at + 2).trim(),
        };
      })
      .filter(Boolean);
  }

  /* Resolves to true when the Web build's index.html is on this site. */
  function hostedWeb(build) {
    if (!build || !build.source || isUrl(build.source)) return Promise.resolve(false);
    var url = href(build.source).replace(/\/?$/, "/") + "index.html";
    return fetch(url, { method: "HEAD", cache: "no-cache" })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; });
  }

  /* ---------------------------------------------------------------- page */

  function sectionHead(title) {
    return '<h2 class="g-sec-title"><span>' + esc(title) + "</span></h2>";
  }

  function buildName(b) {
    return b.label || b.file || b.platform;
  }

  function downloadCard(b, L) {
    var platform = b.platform.toLowerCase();
    return (
      '<div class="dl-card">' +
      '<div class="dl-head">' + pill(platform, b.platform) + '<span class="dl-size mono">' + esc(b.size) + "</span></div>" +
      '<h3 class="dl-name">' + esc(buildName(b)) + "</h3>" +
      '<a class="g-btn g-btn-ghost" href="' + esc(href(b.source)) + '" download>' + esc(L["download label"]) + "</a>" +
      "</div>"
    );
  }

  function player(web, game, frame, L) {
    var cover = ROOT + "assets/images/" + game.image;
    var src = href(web.source).replace(/\/?$/, "/");
    var size = String(frame || "").match(/(\d+)\s*[x×]\s*(\d+)/);
    var ratio = size ? Number(size[1]) / Number(size[2]) : 16 / 9;
    return (
      '<div class="player" data-state="idle" style="--r:' + ratio.toFixed(4) + '">' +
      '<div class="player-backdrop" style="background-image:url(\'' + esc(cover) + '\')" aria-hidden="true"></div>' +
      '<img class="player-cover" src="' + esc(cover) + '" alt="" />' +
      '<button class="player-start" type="button" data-start>' +
      '<span class="play-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span>' +
      '<span class="play-label mono">' + esc(L["play label"]) + "</span>" +
      "</button>" +
      "</div>" +
      '<div class="player-bar mono">' +
      '<span class="player-status"><span class="dot"></span>' + esc("/" + String(web.source).replace(/^\/+/, "")) + "</span>" +
      '<span class="player-tools">' +
      '<button class="icon-btn" type="button" data-restart disabled>↻ ' + esc(L["restart label"]) + "</button>" +
      '<button class="icon-btn" type="button" data-fullscreen disabled>⤢ ' + esc(L["fullscreen label"]) + "</button>" +
      '<a class="icon-btn" href="' + esc(src) + 'index.html" target="_blank" rel="noopener">↗ ' + esc(L["new tab label"]) + "</a>" +
      "</span>" +
      "</div>"
    );
  }

  function featured(b, game, steps, L) {
    var platform = b.platform.toLowerCase();
    var list = (steps[platform] || [])
      .map(function (step, i) {
        return '<li><span class="mono">' + pad(i + 1) + "</span><span>" + inline(step) + "</span></li>";
      })
      .join("");
    return (
      '<div class="feature">' +
      '<img class="feature-cover" src="' + esc(ROOT + "assets/images/" + game.image) + '" alt="' + esc(game.game) + ' cover" />' +
      '<div class="feature-body">' +
      '<div class="dl-head">' + pill(platform, b.platform) + '<span class="dl-size mono">' + esc(b.size) + "</span></div>" +
      '<h2 class="feature-name">' + esc(buildName(b)) + "</h2>" +
      (list ? '<ol class="steps">' + list + "</ol>" : "") +
      '<a class="g-btn g-btn-primary" href="' + esc(href(b.source)) + '" download>' + esc(L["download label"]) + "</a>" +
      "</div></div>"
    );
  }

  function build(doc, hostedCheck) {
    var by = CVParse.index(doc);
    var section = by.games || { tables: [[]], subs: [] };
    var rows = section.tables[0] || [];
    var slug = document.getElementById("game").getAttribute("data-slug");
    var index = -1;
    rows.forEach(function (r, i) { if (slugOf(r.link) === slug) index = i; });
    var game = rows[index];
    if (!game) throw new Error("no game “" + slug + "” in CONTENT.md");

    var site = (by.nav && by.nav.fields.brand) || "Erik Espuñes Jubero";
    var L = sub(section, "Game page").fields;
    var builds = (sub(section, "Game builds").tables[0] || []).filter(function (b) { return b.game === slug && b.source; });
    var details = (sub(section, "Game details").tables[0] || []).filter(function (d) { return d.game === slug; })[0] || {};
    var steps = {};
    sub(section, "Install steps").subs.forEach(function (s) { steps[s.title.toLowerCase()] = s.bullets; });
    var desc = CVParse.byTitle(sub(section, "Game descriptions").subs, slug) || { paragraphs: [] };

    var web = builds.filter(function (b) { return b.platform.toLowerCase() === "web"; })[0];
    var downloads = builds.filter(function (b) { return b !== web; });
    var platforms = [];
    builds.forEach(function (b) { if (platforms.indexOf(b.platform) < 0) platforms.push(b.platform); });
    platforms.sort(function (a, b) { return ORDER.indexOf(a.toLowerCase()) - ORDER.indexOf(b.toLowerCase()); });
    /* Tech tags that name a platform already have a platform pill. */
    var tech = String(game.tech || "").split("·").map(function (t) { return t.trim(); }).filter(function (t) {
      return t && platforms.indexOf(t) < 0;
    });

    document.title = game.game + " · " + site;

    return hostedCheck(web).then(function (hosted) {
      var header =
        '<header class="cs-header g-header"><div class="wrap">' +
        '<a class="back-link" href="' + ROOT + '#s-games">' + esc(L["back label"]) + "</a>" +
        '<div class="eyebrow"><span class="eyebrow-rule"></span>' +
        '<span class="eyebrow-text">' + esc(game["#"]) + " · " + inline(game.subtitle) + "</span></div>" +
        '<h1 class="cs-title">' + inline(game.game) + "</h1>" +
        '<div class="g-pills">' +
        platforms.map(function (p) { return pill(p.toLowerCase(), p); }).join("") +
        (tech.length ? '<span class="g-pills-rule" aria-hidden="true"></span>' : "") +
        tech.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
        "</div></div></header>";

      var playable = web && hosted;
      var hero = playable
        ? player(web, game, details.frame, L)
        : downloads.length ? featured(downloads[0], game, steps, L) : "";
      var rest = playable ? downloads : downloads.slice(1);

      var about = desc.paragraphs.length
        ? '<section class="g-sec">' + sectionHead(L["about label"]) +
          '<p class="g-lead">' + inline(desc.paragraphs[0]) + "</p>" +
          desc.paragraphs.slice(1).map(function (p) { return '<p class="g-body">' + inline(p) + "</p>"; }).join("") +
          "</section>"
        : "";

      var more = rest.length
        ? '<section class="g-sec">' + sectionHead(playable ? L["downloads label"] : L["other builds label"]) +
          '<div class="dl-grid">' + rest.map(function (b) { return downloadCard(b, L); }).join("") + "</div></section>"
        : "";

      var keys = controls(details.controls);
      var ctrl = keys.length
        ? '<section class="g-sec">' + sectionHead(L["controls label"]) + '<div class="ctrl-grid">' +
          keys.map(function (c) {
            return '<div class="ctrl"><span class="ctrl-keys">' +
              c.keys.map(function (k) { return "<kbd>" + esc(k) + "</kbd>"; }).join('<span class="ctrl-or">/</span>') +
              '</span><span class="ctrl-action">' + esc(c.action) + "</span></div>";
          }).join("") + "</div></section>"
        : "";

      var facts =
        '<section class="g-sec"><dl class="g-facts">' +
        [[L["made for label"], game.subtitle], [L["engine label"], tech[0]], [L["year label"], game.year], [L["platforms label"], platforms.join(" · ")]]
          .filter(function (f) { return f[1]; })
          .map(function (f) { return '<div class="g-fact"><dt class="mono">' + esc(f[0]) + "</dt><dd>" + inline(f[1]) + "</dd></div>"; })
          .join("") +
        "</dl>" +
        (details.repo ? '<p class="g-links mono">' + external(details.repo, L["source label"], "g-link") + "</p>" : "") +
        "</section>";

      var others = [];
      for (var i = 1; i <= Math.min(4, rows.length - 1); i++) others.push(rows[(index + i) % rows.length]);
      var moreGames =
        '<section class="g-sec"><div class="g-more-head">' + sectionHead(L["more label"]) +
        '<a class="back-link" href="' + ROOT + '#s-games">' + esc(L["back label"]) + "</a></div>" +
        '<div class="g-more">' +
        others.map(function (r) {
          return '<a class="g-card" href="../' + esc(slugOf(r.link)) + '/">' +
            '<span class="g-card-cover"><img src="' + esc(ROOT + "assets/images/" + r.image) + '" alt="" loading="lazy" />' +
            '<span class="g-card-num mono">' + esc(r["#"]) + "</span></span>" +
            '<span class="g-card-name">' + inline(r.game) + "</span>" +
            '<span class="g-card-sub mono">' + inline(r.subtitle) + " · " + esc(r.year) + "</span></a>";
        }).join("") +
        "</div></section>";

      var root = document.getElementById("game");
      root.innerHTML =
        '<a class="skip" href="#main">Skip to content</a>' +
        '<div class="scanlines" aria-hidden="true"></div>' +
        '<div class="topbar"><div class="topbar-inner">' +
        '<a class="brand" href="' + ROOT + '">' + esc(site) + "</a>" +
        "</div></div>" +
        '<main id="main">' + header +
        (hero ? '<section class="cs-hero g-hero"><div class="wrap">' + hero + "</div></section>" : "") +
        '<div class="wrap g-main">' + about + more + ctrl + facts + moreGames + "</div></main>" +
        '<footer class="footer"><div class="footer-inner"><span>© ' + new Date().getFullYear() + " " + esc(site) +
        "</span><span>" + esc(game.game) + " · " + esc(game.year) + "</span></div></footer>";

      if (playable) wirePlayer(root, href(web.source).replace(/\/?$/, "/") + "index.html", game);
    });
  }

  /* Click to play: the build only loads once asked for, then the bar's
     Restart and Fullscreen come alive. */
  function wirePlayer(root, src, game) {
    var box = root.querySelector(".player");
    var start = box.querySelector("[data-start]");
    var restart = root.querySelector("[data-restart]");
    var full = root.querySelector("[data-fullscreen]");
    var frame;
    start.addEventListener("click", function () {
      frame = document.createElement("iframe");
      frame.title = game.game;
      frame.src = src;
      frame.allow = "fullscreen; autoplay; gamepad";
      frame.setAttribute("allowfullscreen", "");
      box.appendChild(frame);
      box.setAttribute("data-state", "playing");
      restart.disabled = false;
      full.disabled = false;
      frame.focus();
    });
    restart.addEventListener("click", function () {
      if (frame) frame.src = src;
    });
    full.addEventListener("click", function () {
      var el = frame || box;
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    });
  }

  /* ------------------------------------------------------------------ boot */

  fetch(ROOT + "CONTENT.md", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (md) {
      return build(CVParse.parse(md), hostedWeb);
    })
    .catch(function (err) {
      document.getElementById("game").innerHTML =
        '<div class="load-error"><h1>Game unavailable</h1><p>' + esc(err.message) + "</p></div>";
    });
})();
