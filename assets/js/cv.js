// Build v1.38 · 2026-09-21
/* Builds the printable CV from CONTENT.md — the same file the site renders
   from — then offers it to the browser's PDF printer. */
(function () {
  "use strict";

  /* Structure comes from the shared reader in parse.js. */
  var parse = CVParse.parse;

  function inline(text) {
    return String(text === undefined ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2");
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function lines(value) {
    return String(value || "").split("/").map(function (p) {
      return p.trim();
    });
  }

  /* ------------------------------------------------------------ helpers --- */

  /* linkedin.com/in/eespunes rather than the bare handle. */
  function contactText(row) {
    var link = row.link || "";
    if (/^https?:/.test(link)) {
      return link.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    }
    return row.value;
  }

  function toBinary(text) {
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var bytes = unescape(encodeURIComponent(text[i]));
      for (var b = 0; b < bytes.length; b++) {
        out.push(("00000000" + bytes.charCodeAt(b).toString(2)).slice(-8));
      }
    }
    return out.join(" ");
  }

  var PAGES = 2;

  function pageNo(n) {
    var pad = function (v) {
      return ("0" + v).slice(-2);
    };
    return pad(n) + " / " + pad(PAGES);
  }

  function block(label, contentNode) {
    var node = el("div", "cv-block");
    node.appendChild(el("div", "cv-label", label));
    node.appendChild(contentNode);
    return node;
  }

  function heading(text) {
    var node = el("div", "cv-heading");
    node.appendChild(el("span"));
    node.appendChild(el("span", null, inline(text)));
    return node;
  }

  function tags(value) {
    var wrap = el("div", "cv-tags");
    String(value || "").split("·").forEach(function (tag) {
      if (tag.trim()) wrap.appendChild(el("span", "cv-tag", inline(tag.trim())));
    });
    return wrap;
  }

  /* --------------------------------------------------------------- build --- */

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

    var nameLines = lines(home.fields.name);
    var fullName = (by.nav && by.nav.fields.brand) || nameLines.join(" ");
    var role = cv.fields.role || home.fields.eyebrow || "";
    var root = document.getElementById("cv-root");
    document.title = fullName + " — CV";

    var back = document.querySelector(".cv-back");
    if (back) back.textContent = cv.fields["back label"] || "";
    var saveButton = document.querySelector(".cv-save");
    if (saveButton) saveButton.textContent = cv.fields["save label"] || "";

    /* ---------------------------------------------------------- page one */
    var page1 = el("section", "cv-page cv-page--1");
    var rail = el("div", "cv-rail");
    var railTop = el("div");

    var nameBlock = el("div", "cv-block cv-block--name");
    nameBlock.appendChild(el("div", "cv-binary", toBinary(fullName)));
    nameBlock.appendChild(el("div", "cv-bar"));
    var h1 = el("h1", "cv-name");
    nameLines.forEach(function (part, i) {
      if (i) h1.appendChild(document.createElement("br"));
      if (i === nameLines.length - 1) h1.appendChild(el("span", null, part));
      else h1.appendChild(document.createTextNode(part));
    });
    nameBlock.appendChild(h1);
    nameBlock.appendChild(el("div", "cv-role", inline(role)));
    railTop.appendChild(nameBlock);

    var contactRows = (contact.tables[0] || []).filter(function (row) {
      return (row.key || "").toLowerCase() !== "address";
    });
    var contactList = el("div", "cv-contact");
    contactRows.forEach(function (row) {
      contactList.appendChild(el("div", null, inline(contactText(row))));
    });
    railTop.appendChild(block(cv.fields["contact label"] || contact.title, contactList));

    var education = sub(about, "Education");
    if (education && education.tables[0]) {
      var eduList = el("div", "cv-list");
      education.tables[0].forEach(function (row) {
        var item = el("div");
        item.appendChild(el("div", "cv-item-title", inline(row.title)));
        item.appendChild(el("div", "cv-item-sub", inline(row.institution)));
        item.appendChild(el("div", "cv-item-when", inline(row.years)));
        eduList.appendChild(item);
      });
      railTop.appendChild(block(education.title, eduList));
    }

    var languages = sub(about, "Languages");
    if (languages && languages.tables[0]) {
      var langList = el("div", "cv-langs");
      languages.tables[0].forEach(function (row) {
        var item = el("div", "cv-lang");
        item.appendChild(el("span", null, inline(row.language)));
        item.appendChild(el("span", null, inline(row.level)));
        langList.appendChild(item);
      });
      railTop.appendChild(block(languages.title, langList));
    }

    var certs = sub(cv, "Certifications");
    if (certs && certs.tables[0] && certs.tables[0].length) {
      var certList = el("div", "cv-certs");
      certs.tables[0].forEach(function (row) {
        certList.appendChild(
          el(
            "div",
            null,
            inline(row.title) +
              (row.note ? ' <em>(' + inline(row.note) + ")</em>" : "")
          )
        );
      });
      railTop.appendChild(block(certs.title, certList));
    }

    if (cv.fields.also) {
      railTop.appendChild(
        block(cv.fields["also label"] || "Also", el("div", "cv-also", inline(cv.fields.also)))
      );
    }
    rail.appendChild(railTop);
    rail.appendChild(el("div", "cv-pageno", pageNo(1)));
    page1.appendChild(rail);

    var main = el("div", "cv-main");
    var mainTop = el("div");

    var aboutSection = el("div", "cv-section");
    aboutSection.appendChild(heading(cv.fields["about label"] || about.title));
    [about.fields.lead, about.fields.body].forEach(function (text, i) {
      if (!text) return;
      var p = el("p", "cv-body", inline(text));
      if (i) p.style.marginTop = "7px";
      aboutSection.appendChild(p);
    });
    mainTop.appendChild(aboutSection);

    var numbers = sub(about, "Numbers");
    if (numbers && numbers.tables[0]) {
      var statsSection = el("div", "cv-section");
      statsSection.appendChild(heading(cv.fields["highlights label"] || numbers.title));
      var stats = el("div", "cv-stats");
      numbers.tables[0].forEach(function (row) {
        var stat = el("div", "cv-stat");
        stat.appendChild(el("div", "cv-stat-num", inline(row.figure)));
        stat.appendChild(el("div", "cv-stat-label", inline(row.label)));
        stats.appendChild(stat);
      });
      statsSection.appendChild(stats);
      mainTop.appendChild(statsSection);
    }

    var skills = sub(cv, "Skill groups");
    var compSection = el("div", "cv-section");
    compSection.appendChild(heading(cv.fields["competencies label"] || ((by.competencies || {}).title || "")));
    if (cv.fields.summary) {
      compSection.appendChild(el("p", "cv-body", inline(cv.fields.summary)));
    }
    if (skills && skills.tables[0]) {
      skills.tables[0].forEach(function (row) {
        var group = el("div", "cv-group");
        group.appendChild(el("div", "cv-group-label", inline(row.group)));
        group.appendChild(tags(row.tags));
        compSection.appendChild(group);
      });
    }
    mainTop.appendChild(compSection);
    main.appendChild(mainTop);

    var mainBottom = el("div");
    if (cv.fields.quote) {
      var quote = el("div", "cv-quote");
      quote.appendChild(el("p", null, inline(cv.fields.quote)));
      mainBottom.appendChild(quote);
    }
    var footer = el("div", "cv-footer");
    footer.appendChild(el("span", null, inline(fullName + " · " + role)));
    var version = el("span", "cv-version");
    footer.appendChild(version);
    CVParse.loadVersion().then(function (info) {
      version.textContent = CVParse.versionText(info, cv.fields["version label"]);
    });
    footer.appendChild(el("span", null, inline(cv.fields["footer right"] || "")));
    mainBottom.appendChild(footer);
    main.appendChild(mainBottom);
    page1.appendChild(main);
    root.appendChild(page1);

    /* ---------------------------------------------------------- page two */
    var page2 = el("section", "cv-page cv-page--2");
    var head = el("div", "cv-page-head");
    var headLeft = el("div");
    headLeft.appendChild(el("div", "cv-kicker", inline(cv.fields.kicker || "")));
    headLeft.appendChild(el("h2", null, inline(fullName)));
    head.appendChild(headLeft);
    var bar = el("span");
    bar.style.cssText = "width:52px;height:3px;background:var(--accent);display:block";
    head.appendChild(bar);
    page2.appendChild(head);

    var entries = el("div", "cv-entries");
    experience.subs.forEach(function (entry) {
      if (entry.depth !== 3) return;
      /* An entry with client engagements contributes those; otherwise itself. */
      if (entry.subs.length) {
        entry.subs.forEach(function (engagement) {
          entries.appendChild(
            cvEntry(
              datesFrom(engagement.fields.meta) || lines(entry.fields.period),
              entry.title.split("·")[0].trim() + " · " + engagement.title,
              engagement.fields.meta,
              engagement.bullets,
              null
            )
          );
        });
      } else {
        entries.appendChild(
          cvEntry(
            datesFrom(entry.fields.meta) || lines(entry.fields.period),
            entry.title,
            entry.fields.meta,
            entry.bullets,
            entry.fields.summary
          )
        );
      }
    });

    var projects = by.projects;
    if (projects && projects.tables[0] && cv.fields["projects label"]) {
      var projectBody = el("div", "cv-prior");
      projects.tables[0].forEach(function (row) {
        var item = el("div");
        var head = el("div", "cv-project-head");
        head.appendChild(el("h3", null, inline(row.project)));
        if (row.status) {
          head.appendChild(el("span", "cv-project-status", inline(row.status)));
        }
        item.appendChild(head);
        item.appendChild(el("p", null, inline(row.description)));
        if (row.stack) {
          item.appendChild(el("div", "cv-project-stack", inline(row.stack)));
        }
        projectBody.appendChild(item);
      });
      entries.appendChild(
        entryShell(lines(cv.fields["projects label"]), projectBody)
      );
    }

    page2.appendChild(entries);

    var foot = el("div", "cv-page-foot");
    foot.appendChild(
      el(
        "span",
        null,
        contactRows
          .slice(0, 3)
          .map(function (row) {
            return inline(contactText(row));
          })
          .join(" · ")
      )
    );
    var footVersion = el("span", "cv-version");
    foot.appendChild(footVersion);
    CVParse.loadVersion().then(function (versionInfo) {
      footVersion.textContent = CVParse.versionText(versionInfo, cv.fields["version label"]);
    });
    foot.appendChild(el("span", null, pageNo(2)));
    page2.appendChild(foot);
    root.appendChild(page2);
  }

  /* "Eindhoven, NL · Remote · Jul 2025 – May 2026" → ["Jul 2025", "—", "May 2026"] */
  function datesFrom(meta) {
    var match = String(meta || "").match(
      /([A-Z][a-z]{2}\s+\d{4})\s*[–—-]\s*([A-Z][a-z]{2}\s+\d{4}|Present)/
    );
    return match ? [match[1], "—", match[2]] : null;
  }

  function entryShell(when, bodyNode) {
    var entry = el("div", "cv-entry");
    entry.appendChild(
      el(
        "div",
        "cv-entry-when",
        when
          .map(function (part, i) {
            return when.length === 3 && i === 1 ? "<em>" + part + "</em>" : part;
          })
          .join("<br />")
      )
    );
    var body = el("div", "cv-entry-body");
    body.appendChild(bodyNode);
    entry.appendChild(body);
    return entry;
  }

  function cvEntry(when, title, meta, bullets, summary) {
    var body = el("div");
    body.appendChild(el("h3", null, inline(title)));
    if (meta) body.appendChild(el("div", "cv-entry-meta", inline(placeOf(meta))));
    if (summary) {
      var p = el("p", null, inline(summary));
      p.style.marginTop = "8px";
      body.appendChild(p);
    }
    if (bullets && bullets.length) {
      var ul = el("ul");
      bullets.forEach(function (text) {
        ul.appendChild(el("li", null, inline(text)));
      });
      body.appendChild(ul);
    }
    return entryShell(when, body);
  }

  /* Drop the date range from a meta line — the date column already shows it. */
  function placeOf(meta) {
    return String(meta)
      .split("·")
      .filter(function (part) {
        return !/\d{4}/.test(part);
      })
      .join(" · ")
      .trim();
  }

  /* ---------------------------------------------------------------- boot */

  fetch("CONTENT.md", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (md) {
      build(parse(md));
      var save = document.querySelector(".cv-save");
      if (save) save.addEventListener("click", function () { window.print(); });
      if (/[?&]print=1/.test(location.search)) {
        window.addEventListener("load", function () {
          setTimeout(function () { window.print(); }, 350);
        });
      }
    })
    .catch(function (err) {
      document.getElementById("cv-root").appendChild(
        el(
          "div",
          "cv-error",
          "<h1>CV unavailable</h1><p>CONTENT.md could not be loaded (" +
            err.message +
            "). Serve the folder over HTTP — fetch is blocked on file:// URLs.</p>"
        )
      );
    });
})();
