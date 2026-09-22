// Build v1.88 · 2026-09-22
/* Builds the printable CV (Spine v3) from CONTENT.md — the same file the site
   renders from — then offers it to the browser's PDF printer. */
(function () {
  "use strict";

  var parse = CVParse.parse;

  function inline(text) {
    return String(text === undefined ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em class="accent">$2</em>');
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function externalAttrs(node, href) {
    node.href = href;
    if (/^https?:/.test(href)) {
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    }
  }

  /* linkedin.com/in/eespunes rather than the bare handle. */
  function contactText(row) {
    var link = row.link || "";
    if (/^https?:/.test(link)) {
      return link.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    }
    return row.value;
  }

  function contactNode(row, className) {
    var node = row.link ? el("a", className) : el("span", className);
    if (row.link) externalAttrs(node, row.link);
    node.innerHTML = inline(contactText(row));
    return node;
  }

  var PAGES = 2;
  function pageNo(n) {
    var pad = function (v) { return ("0" + v).slice(-2); };
    return pad(n) + " / " + pad(PAGES);
  }

  /* "Hamburg, DE · Mar 2022 – Apr 2025 · In-house product" →
     { dates: "Mar 2022 – Apr 2025", place: "Hamburg, DE · In-house product" } */
  function splitMeta(meta) {
    var parts = String(meta || "").split("·").map(function (p) { return p.trim(); });
    var dates = "";
    var rest = [];
    parts.forEach(function (part) {
      if (!dates && /\d{4}/.test(part)) dates = part;
      else rest.push(part);
    });
    return { dates: dates, place: rest.join(" · ") };
  }

  /* "Mar 2022 – Apr 2025" → green left half, grey right half. */
  function dateLine(text) {
    var m = String(text).split(/–|—/);
    if (m.length < 2) return el("div", "cv-when mono", inline(text));
    return el(
      "div",
      "cv-when mono",
      inline(m[0].trim()) + " – <span>" + inline(m.slice(1).join("–").trim()) + "</span>"
    );
  }

  /* --------------------------------------------------------- spine plumbing */

  /* The spine is a 2-column grid: a 28px rail (line + dot) beside content. */
  function sectionHead(grid, title) {
    var head = el("div", "cv-section-head");
    head.appendChild(el("span", "cv-section-bar"));
    head.appendChild(el("span", null, inline(title)));
    grid.appendChild(head);
  }

  function spineItem(grid, contentNode, opts) {
    var rail = el("div", "cv-rail-cell");
    var line = el("div", "cv-rail-line" + (opts.first ? " is-first" : "") + (opts.last ? " is-last" : ""));
    rail.appendChild(line);
    rail.appendChild(el("div", "cv-dot" + (opts.hollow ? " is-hollow" : "")));
    grid.appendChild(rail);
    contentNode.classList.add("cv-spine-content");
    if (opts.tight) contentNode.classList.add("is-tight");
    grid.appendChild(contentNode);
  }

  function bullets(items) {
    var ul = el("ul");
    items.forEach(function (text) { ul.appendChild(el("li", null, inline(text))); });
    return ul;
  }

  function tagPills(value) {
    var wrap = el("div", "cv-tags");
    String(value || "").split("·").forEach(function (tag) {
      if (tag.trim()) wrap.appendChild(el("span", "cv-tag", inline(tag.trim())));
    });
    return wrap;
  }

  function dividerRow(list, label, htmlValue) {
    var row = el("div", "cv-row");
    row.appendChild(el("div", "cv-row-label mono", inline(label)));
    row.appendChild(el("div", "cv-row-value", htmlValue));
    list.appendChild(row);
  }

  function footerVersion(cv) {
    var version = el("span", "cv-version");
    CVParse.loadVersion().then(function (info) {
      version.textContent = CVParse.versionText(info, cv.fields["version label"]);
    });
    return version;
  }

  /* ----------------------------------------------------------------- build */

  function build(doc) {
    var by = CVParse.index(doc);
    var sub = function (section, title) {
      return CVParse.byTitle(section ? section.subs : [], title);
    };

    var home = by.home || { fields: {} };
    var about = by.about || { fields: {}, subs: [] };
    var cv = by.cv || { fields: {}, subs: [] };
    var contact = by.contact || { fields: {}, tables: [[]] };
    var experience = by.experience || { subs: [] };
    var competencies = by.competencies || { fields: {}, subs: [] };
    var projects = by.projects || { tables: [[]] };

    var nameParts = String(home.fields.name || "").split("/").map(function (p) { return p.trim(); });
    var fullName = (by.nav && by.nav.fields.brand) || nameParts.join(" ");
    var role = cv.fields.role || home.fields.eyebrow || "";
    var contactRows = contact.tables[0] || [];
    var rowByKey = {};
    contactRows.forEach(function (row) { rowByKey[(row.key || "").toLowerCase()] = row; });

    var root = document.getElementById("cv-root");
    document.title = fullName + " — CV";
    var back = document.querySelector(".cv-back");
    if (back) back.textContent = cv.fields["back label"] || "";
    var saveButton = document.querySelector(".cv-save");
    if (saveButton) saveButton.textContent = cv.fields["save label"] || "";

    /* ------------------------------------------------------------ page one */
    var page1 = el("section", "cv-page cv-page--1");

    var masthead = el("header", "cv-masthead");
    var mastLeft = el("div");
    var eyebrow = el("div", "cv-eyebrow");
    eyebrow.appendChild(el("span", "cv-eyebrow-rule"));
    eyebrow.appendChild(el("span", "cv-role mono", inline(role)));
    mastLeft.appendChild(eyebrow);

    var h1 = el("h1", "cv-name");
    nameParts.forEach(function (part, i) {
      if (i) h1.appendChild(document.createTextNode(" "));
      if (i === nameParts.length - 1) h1.appendChild(el("span", null, part));
      else h1.appendChild(document.createTextNode(part));
    });
    mastLeft.appendChild(h1);
    if (about.fields.lead) {
      mastLeft.appendChild(el("p", "cv-lead", inline(about.fields.lead)));
    }
    masthead.appendChild(mastLeft);

    var mastContact = el("div", "cv-contact");
    ["email", "phone"].forEach(function (key) {
      var row = rowByKey[key];
      if (!row) return;
      var item = el("div", "cv-contact-item");
      item.appendChild(el("div", "cv-contact-label mono", inline(row.key)));
      item.appendChild(contactNode(row, "cv-contact-value"));
      mastContact.appendChild(item);
    });
    if (contact.fields.location) {
      var loc = el("div", "cv-contact-item");
      loc.appendChild(el("div", "cv-contact-label mono", "Location"));
      loc.appendChild(el("span", "cv-contact-value", inline(contact.fields.location)));
      mastContact.appendChild(loc);
    }
    var online = contactRows.filter(function (row) {
      return /^https?:/.test(row.link || "");
    });
    if (online.length && cv.fields["online label"]) {
      var group = el("div", "cv-contact-item");
      group.appendChild(el("div", "cv-contact-label mono", inline(cv.fields["online label"])));
      var links = el("div", "cv-contact-value cv-online");
      online.forEach(function (row) { links.appendChild(contactNode(row, null)); });
      group.appendChild(links);
      mastContact.appendChild(group);
    }
    masthead.appendChild(mastContact);
    page1.appendChild(masthead);

    var body1 = el("div", "cv-body");
    var grid1 = el("div", "cv-spine");

    /* competencies */
    if (cv.fields["competencies label"]) {
      sectionHead(grid1, cv.fields["competencies label"]);
    }
    var cards = (sub(competencies, "Cards") || { tables: [[]] }).tables[0] || [];
    cards.forEach(function (row, i) {
      var item = el("div");
      item.appendChild(el("h3", null, inline(row.title)));
      item.appendChild(el("p", null, inline(row.description)));
      item.appendChild(tagPills(row.tags));
      spineItem(grid1, item, { first: i === 0, last: i === cards.length - 1 });
    });

    /* divider list: skill groups + spoken languages + additional */
    var full = el("div", "cv-rows");
    var groups = (sub(cv, "Skill groups") || { tables: [[]] }).tables[0] || [];
    groups.forEach(function (row) {
      dividerRow(full, row.group, inline(row.tags));
    });
    var languages = sub(about, "Languages");
    if (languages && languages.tables[0] && cv.fields["languages label"]) {
      dividerRow(
        full,
        cv.fields["languages label"],
        languages.tables[0]
          .map(function (row) {
            return inline(row.language) + " <span>" + inline(row.level) + "</span>";
          })
          .join(" · ")
      );
    }
    if (cv.fields.also && cv.fields["also label"]) {
      dividerRow(full, cv.fields["also label"], inline(cv.fields.also));
    }
    var fullWrap = el("div", "cv-span-both");
    fullWrap.appendChild(full);
    grid1.appendChild(fullWrap);

    /* education */
    var education = sub(about, "Education");
    if (education && education.tables[0] && cv.fields["education label"]) {
      sectionHead(grid1, cv.fields["education label"]);
      var eduRows = education.tables[0];
      eduRows.forEach(function (row, i) {
        var item = el("div");
        var years = String(row.years || "");
        var expected = /\(expected\)/i.test(years);
        var when = dateLine(years.replace(/\s*\(expected\)\s*/i, ""));
        item.appendChild(when);
        var title = el("div", "cv-item-title", inline(row.title));
        if (expected) title.appendChild(el("span", "cv-badge mono", "expected"));
        item.appendChild(title);
        item.appendChild(el("div", "cv-item-sub", inline(row.institution)));
        spineItem(grid1, item, { first: i === 0, last: i === eduRows.length - 1, hollow: true, tight: true });
      });
    }

    body1.appendChild(grid1);
    var foot1 = el("footer", "cv-foot");
    foot1.appendChild(el("span", "mono", inline(fullName + " · " + role)));
    foot1.appendChild(footerVersion(cv));
    foot1.appendChild(el("span", "mono", pageNo(1)));
    body1.appendChild(foot1);
    page1.appendChild(body1);
    root.appendChild(page1);

    /* ------------------------------------------------------------ page two */
    var page2 = el("section", "cv-page cv-page--2");
    var body2 = el("div", "cv-body");

    var head2 = el("div", "cv-page2-head");
    head2.appendChild(el("span", "cv-page2-name", inline(fullName)));
    head2.appendChild(el("span", "cv-page2-role mono", inline(role)));
    body2.appendChild(head2);

    var grid2 = el("div", "cv-spine");
    if (cv.fields["experience label"]) {
      sectionHead(grid2, cv.fields["experience label"]);
    }
    var entries = experience.subs.filter(function (s) { return s.depth === 3; });
    entries.forEach(function (entry, i) {
      var meta = splitMeta(entry.fields.meta);
      var item = el("div");
      if (meta.dates) item.appendChild(dateLine(meta.dates));
      item.appendChild(el("h3", null, inline(entry.title)));
      if (meta.place) item.appendChild(el("div", "cv-item-sub", inline(meta.place)));
      if (entry.fields.summary) item.appendChild(el("p", null, inline(entry.fields.summary)));

      entry.subs.forEach(function (engagement) {
        var card = el("div", "cv-eng");
        var engMeta = engagement.fields.meta || "";
        var cardHead = el("div", "cv-eng-head");
        var prefix = cv.fields["engagement label"];
        cardHead.appendChild(
          el("h4", null, inline(prefix ? prefix + " · " + engagement.title : engagement.title))
        );
        cardHead.appendChild(el("span", "mono", inline(engMeta)));
        card.appendChild(cardHead);
        if (engagement.bullets.length) card.appendChild(bullets(engagement.bullets));
        item.appendChild(card);
      });
      if (entry.bullets.length) item.appendChild(bullets(entry.bullets));
      spineItem(grid2, item, { first: i === 0, last: i === entries.length - 1 });
    });

    /* personal projects */
    var projectRows = projects.tables[0] || [];
    if (projectRows.length && cv.fields["projects label"]) {
      sectionHead(grid2, cv.fields["projects label"]);
      projectRows.forEach(function (row, i) {
        var item = el("div");
        if (row.status) {
          item.appendChild(el("div", "cv-status mono", inline(String(row.status).toLowerCase())));
        }
        var title = el("div", "cv-item-title", inline(row.project));
        if (row.stack) title.appendChild(el("span", "cv-stack mono", inline(row.stack)));
        item.appendChild(title);
        item.appendChild(el("p", null, inline(row.description)));
        spineItem(grid2, item, {
          first: i === 0,
          last: i === projectRows.length - 1,
          hollow: true,
          tight: true,
        });
      });
    }
    body2.appendChild(grid2);
    page2.appendChild(body2);

    var foot2 = el("footer", "cv-foot cv-foot--dark");
    var footContacts = el("span", "cv-foot-contacts mono");
    contactRows
      .filter(function (row) {
        return (row.key || "").toLowerCase() !== "address";
      })
      .forEach(function (row, i) {
        if (i) footContacts.appendChild(document.createTextNode(" · "));
        footContacts.appendChild(contactNode(row, null));
      });
    foot2.appendChild(footContacts);
    foot2.appendChild(footerVersion(cv));
    foot2.appendChild(el("span", "mono", pageNo(2)));
    page2.appendChild(foot2);
    root.appendChild(page2);
  }

  /* ------------------------------------------------------------------ boot */

  fetch("CONTENT.md", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (md) {
      try {
        build(parse(md));
      } catch (err) {
        err.while_rendering = true;
        throw err;
      }
      var save = document.querySelector(".cv-save");
      if (save) save.addEventListener("click", function () { window.print(); });
      if (/[?&]print=1/.test(location.search)) {
        window.addEventListener("load", function () {
          setTimeout(function () { window.print(); }, 350);
        });
      }
    })
    .catch(function (err) {
      var root = document.getElementById("cv-root");
      root.appendChild(
        el(
          "div",
          "cv-error",
          err.while_rendering
            ? "<h1>CV unavailable</h1><p>CONTENT.md loaded but the CV could not be built: " +
              err.message + "</p>"
            : "<h1>CV unavailable</h1><p>CONTENT.md could not be loaded (" + err.message +
              "). Serve the folder over HTTP — fetch is blocked on file:// URLs.</p>"
        )
      );
    });
})();
