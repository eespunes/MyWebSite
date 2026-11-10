// Build v1.166 · 2026-11-10
/* Languages: which version of the site this page is, the content it reads,
   the EN · ES · CA · NL switcher and the "also available in" hint. Shared by
   the site (content.js) and the CV (cv.js).

   Each language folder (/es/, /ca/, /nl/) holds copies of index.html and
   cv.html written by scripts/build-languages.js. Their <html> carries
     lang          the language this page is in
     data-root     the way back to the site root ("../")
     data-content  the content file it reads (CONTENT.es.md)
   The root pages carry none of these and read CONTENT.md.

   CONTENT.md is always loaded too: it holds ## Translations, and any section
   a translation leaves out falls back to the English one. */
(function (root) {
  "use strict";

  var html = typeof document !== "undefined" ? document.documentElement : null;
  var page = {
    lang: (html && html.getAttribute("lang")) || "en",
    root: (html && html.getAttribute("data-root")) || "",
    file: (html && html.getAttribute("data-content")) || "CONTENT.md",
  };

  /* The visitor's choice, once they have made one: picked a language, or
     closed the hint. Either way the hint stops asking. */
  var CHOICE_KEY = "site-lang";

  /* Every language folder has its own index.html and cv.html; everything else
     (assets, games, project pages) lives once, at the root. */
  var LOCAL = /^(index|cv)\.html([?#].*)?$/;

  function url(href) {
    var value = String(href || "");
    if (!value || /^(#|\/|[a-z][a-z0-9+.-]*:)/i.test(value) || LOCAL.test(value)) return value;
    return page.root + value;
  }

  /* ------------------------------------------------------------- content */

  function fetchText(file) {
    return fetch(page.root + file, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error(file + ": HTTP " + res.status);
      return res.text();
    });
  }

  /* Sections are swapped whole, by their (English) heading: a translation
     either carries a section or leaves it to CONTENT.md. */
  function merge(base, own) {
    if (!own || own === base) return base;
    var mine = root.CVParse.index(own);
    var theirs = root.CVParse.index(base);
    var sections = base.sections.map(function (s) {
      return mine[s.title.toLowerCase()] || s;
    });
    own.sections.forEach(function (s) {
      if (!theirs[s.title.toLowerCase()]) sections.push(s);
    });
    return { sections: sections };
  }

  /* An unreadable translation shows the English page rather than none. */
  function load() {
    var base = fetchText("CONTENT.md").then(root.CVParse.parse);
    var own =
      page.file === "CONTENT.md"
        ? base
        : fetchText(page.file).then(root.CVParse.parse).catch(function () {
            return null;
          });
    return Promise.all([base, own]).then(function (docs) {
      return merge(docs[0], docs[1]);
    });
  }

  /* The ## Translations table, one row per language. */
  function translations(doc) {
    var section = root.CVParse.index(doc).translations;
    return ((section && section.tables[0]) || []).map(function (row) {
      return {
        code: String(row.code || "").toLowerCase(),
        name: row.name || "",
        path: row.path || "/",
        file: row.file || "",
        browser: /^yes$/i.test(row.browser || ""),
        countries: String(row.countries || "")
          .split("·")
          .map(function (c) {
            return c.trim().toUpperCase();
          })
          .filter(Boolean),
      };
    });
  }

  function byCode(list, code) {
    return list.filter(function (t) {
      return t.code === code;
    })[0];
  }

  /* --------------------------------------------------------- which country */

  /* The site is static, so there is no server to geolocate a visitor. The
     time zone the browser reports is the best stand-in that needs no network
     request; the region in the browser language (es-ES) is the fallback. */
  var TIME_ZONES = {
    "Europe/Madrid": "ES", "Atlantic/Canary": "ES", "Africa/Ceuta": "ES",
    "Europe/Andorra": "AD",
    "Europe/Amsterdam": "NL", "Europe/Brussels": "BE",
    "America/Paramaribo": "SR", "America/Aruba": "AW", "America/Curacao": "CW",
    "America/Lower_Princes": "SX", "America/Kralendijk": "BQ",
    "America/Mexico_City": "MX", "America/Cancun": "MX", "America/Merida": "MX",
    "America/Monterrey": "MX", "America/Matamoros": "MX", "America/Chihuahua": "MX",
    "America/Ciudad_Juarez": "MX", "America/Ojinaga": "MX", "America/Mazatlan": "MX",
    "America/Bahia_Banderas": "MX", "America/Hermosillo": "MX", "America/Tijuana": "MX",
    "America/Buenos_Aires": "AR", "America/Bogota": "CO",
    "America/Santiago": "CL", "America/Punta_Arenas": "CL", "Pacific/Easter": "CL",
    "America/Lima": "PE", "America/Caracas": "VE",
    "America/Guayaquil": "EC", "Pacific/Galapagos": "EC",
    "America/Guatemala": "GT", "America/Havana": "CU", "America/La_Paz": "BO",
    "America/Santo_Domingo": "DO", "America/Tegucigalpa": "HN", "America/Asuncion": "PY",
    "America/El_Salvador": "SV", "America/Managua": "NI", "America/Costa_Rica": "CR",
    "America/Panama": "PA", "America/Montevideo": "UY", "America/Puerto_Rico": "PR",
    "Africa/Malabo": "GQ",
  };

  function country(env) {
    var zone = env.timeZone || "";
    if (TIME_ZONES[zone]) return TIME_ZONES[zone];
    if (/^America\/Argentina\//.test(zone)) return "AR";
    var tag = String((env.languages || [])[0] || "").split("-");
    return tag.length > 1 && /^[a-z]{2}$/i.test(tag[tag.length - 1])
      ? tag[tag.length - 1].toUpperCase()
      : "";
  }

  function primary(tag) {
    return String(tag || "").split("-")[0].toLowerCase();
  }

  /* Which language to offer, or null. A language marked Browser is offered
     to anyone whose browser speaks it (Catalan has no country of its own
     besides Andorra); the rest go by the visitor's country. */
  function pick(env, list, current) {
    var spoken = (env.languages || []).map(primary);
    var chosen = list.filter(function (t) {
      return t.browser && spoken.indexOf(t.code) !== -1;
    })[0];
    if (!chosen) {
      var where = country(env);
      chosen = list.filter(function (t) {
        return where && t.countries.indexOf(where) !== -1;
      })[0];
    }
    return chosen && chosen.code !== current ? chosen.code : null;
  }

  function environment() {
    var zone = "";
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (err) {}
    var nav = root.navigator || {};
    return {
      timeZone: zone,
      languages: nav.languages && nav.languages.length ? nav.languages : [nav.language || ""],
    };
  }

  /* --------------------------------------------------------------- links */

  /* The same page (site or CV, same #section) in another language. */
  function hrefFor(target) {
    var loc = root.location || { pathname: "", hash: "" };
    var file = /cv\.html$/.test(loc.pathname) ? "cv.html" : "";
    var href = page.root + target.path.replace(/^\//, "") + file;
    return (href || "./") + (loc.hash || "");
  }

  function remember(code) {
    try {
      root.localStorage.setItem(CHOICE_KEY, code);
    } catch (err) {}
  }

  function remembered() {
    try {
      return root.localStorage.getItem(CHOICE_KEY);
    } catch (err) {
      return null;
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* EN · ES · CA · NL. Labelled from this page's own ## Language section. */
  function switcher(doc) {
    var list = translations(doc);
    var own = root.CVParse.index(doc).language || { fields: {} };
    var nav = el("nav", "lang-switch mono");
    nav.setAttribute("aria-label", own.fields["switcher label"] || "Language");
    list.forEach(function (t) {
      var a = el("a", null, t.code.toUpperCase());
      a.href = hrefFor(t);
      a.hreflang = t.code;
      a.lang = t.code;
      a.title = t.name;
      if (t.code === page.lang) a.setAttribute("aria-current", "true");
      a.addEventListener("click", function () {
        remember(t.code);
      });
      nav.appendChild(a);
    });
    return nav;
  }

  /* "Esta página también está disponible en español." Written entirely in
     the offered language, from that language's own ## Language section. */
  function hintCard(target, current, theirs) {
    var copy = root.CVParse.index(theirs).language || { fields: {}, tables: [] };
    var names = {};
    (copy.tables[0] || []).forEach(function (row) {
      names[String(row.code || "").toLowerCase()] = row.name;
    });
    if (!copy.fields.hint || !copy.fields["switch label"]) return null;

    var card = el("aside", "lang-hint");
    card.lang = target.code;
    card.setAttribute("aria-label", target.name);

    var head = el("div", "lang-hint-head");
    head.appendChild(el("span", "lang-hint-code mono", target.code.toUpperCase()));
    head.appendChild(el("span", "lang-hint-name mono", target.name));
    var close = el("button", "lang-hint-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", copy.fields["close label"] || "×");
    head.appendChild(close);
    card.appendChild(head);

    card.appendChild(el("p", "lang-hint-text", copy.fields.hint));

    var actions = el("div", "lang-hint-actions");
    var go = el("a", "btn btn-primary btn-sm", copy.fields["switch label"] + " →");
    go.href = hrefFor(target);
    go.hreflang = target.code;
    go.addEventListener("click", function () {
      remember(target.code);
    });
    actions.appendChild(go);
    if (copy.fields["stay label"] && names[current]) {
      var stay = el(
        "button",
        "lang-hint-stay mono",
        copy.fields["stay label"].replace("{language}", names[current])
      );
      stay.type = "button";
      actions.appendChild(stay);
      stay.addEventListener("click", dismiss);
    }
    card.appendChild(actions);

    function dismiss() {
      remember(current);
      card.classList.remove("is-open");
      setTimeout(function () {
        if (card.parentNode) card.parentNode.removeChild(card);
      }, 250);
    }
    close.addEventListener("click", dismiss);
    return card;
  }

  /* Offers the visitor's language once, unless they have already chosen. */
  function offerHint(doc, mount) {
    if (remembered()) return Promise.resolve(null);
    var list = translations(doc);
    var code = pick(environment(), list, page.lang);
    var target = code && byCode(list, code);
    if (!target || !target.file) return Promise.resolve(null);
    return fetchText(target.file)
      .then(root.CVParse.parse)
      .then(function (theirs) {
        var card = hintCard(target, page.lang, theirs);
        if (!card) return null;
        (mount || document.body).appendChild(card);
        requestAnimationFrame(function () {
          card.classList.add("is-open");
        });
        return card;
      })
      .catch(function () {
        return null;
      });
  }

  var api = {
    page: page,
    url: url,
    load: load,
    merge: merge,
    translations: translations,
    country: country,
    pick: pick,
    switcher: switcher,
    offerHint: offerHint,
  };
  root.CVLang = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
