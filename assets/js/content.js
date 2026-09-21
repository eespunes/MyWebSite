// Build v1.54 · 2026-09-21
/* Reads CONTENT.md and builds the page from it. Nothing here hard-codes copy:
   every string on screen comes from the Markdown. */
(function () {
  "use strict";

  /* Structure comes from the shared reader in parse.js. */
  var parse = CVParse.parse;

  /* Inline markdown → HTML, with everything else escaped. */
  function inline(text) {
    var html = String(text === undefined ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, href) {
      return (
        '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' +
        label + "</a>"
      );
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(
      /(^|[^*])\*([^*]+)\*/g,
      '$1<em class="accent">$2</em>'
    );
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    return html;
  }

  /* `Label → target` pairs used for buttons and links. */
  function linkField(value) {
    if (!value) return null;
    var parts = String(value).split("→");
    if (parts.length < 2) return { label: value.trim(), href: "" };
    return { label: parts[0].trim(), href: parts[1].trim() };
  }

  /* Title strings use " / " to mark a line break. */
  function titleLines(value) {
    return String(value || "")
      .split("/")
      .map(function (part) {
        return part.trim();
      });
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function externalAttrs(a, href) {
    a.href = href;
    if (/^https?:/.test(href)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
  }

  /* -------------------------------------------------------------- sections */

  var SECTION_ID = {
    home: "s-home",
    about: "s-about",
    experience: "s-experience",
    competencies: "s-skills",
    projects: "s-projects",
    games: "s-games",
    contact: "s-contact",
  };

  function sectionShell(key, section, extraClass) {
    var node = el("section", "section " + (extraClass || ""));
    node.id = SECTION_ID[key];
    node.setAttribute("data-snap", "1");
    if ((section.fields.theme || "") === "light") {
      node.classList.add("section-light");
    }
    return node;
  }

  function sideHead(section, light) {
    var wrapper = el("div");
    var h2 = el(
      "h2",
      "side-title" + (light ? " light" : ""),
      titleLines(section.fields.title).join("<br />")
    );
    wrapper.appendChild(h2);
    wrapper.appendChild(el("span", "rule"));
    if (section.fields["side note"]) {
      wrapper.appendChild(
        el("p", "side-note", inline(section.fields["side note"]))
      );
    }
    return wrapper;
  }

  function renderHome(section) {
    var node = sectionShell("home", section, "section-home");

    var marquee = el("div", "marquee");
    marquee.setAttribute("aria-hidden", "true");
    var track = el("div", "marquee-track");
    var bits = toBinary(section.fields.name || "");
    track.appendChild(el("span", null, bits));
    track.appendChild(el("span", null, bits));
    marquee.appendChild(track);
    node.appendChild(marquee);

    var grid = el("div", "wrap home-grid");
    var left = el("div");

    var eyebrow = el("div", "eyebrow");
    eyebrow.appendChild(el("span", "eyebrow-rule"));
    eyebrow.appendChild(
      el("span", "eyebrow-text", inline(section.fields.eyebrow))
    );
    left.appendChild(eyebrow);

    var names = titleLines(section.fields.name);
    var h1 = el("h1", "hero-title");
    names.forEach(function (part, i) {
      if (i) h1.appendChild(document.createElement("br"));
      if (i === names.length - 1) h1.appendChild(el("span", null, part));
      else h1.appendChild(document.createTextNode(part));
    });
    left.appendChild(h1);

    var terminal = el("div", "terminal");
    terminal.appendChild(el("span", "prompt", "$"));
    terminal.appendChild(document.createTextNode(" "));
    var typed = el("span");
    typed.id = "cv-type";
    terminal.appendChild(typed);
    terminal.appendChild(el("span", "caret", "&nbsp;"));
    left.appendChild(terminal);
    window.CV_TERMINAL_LINES = section.bullets.slice();

    left.appendChild(el("p", "hero-lead", inline(section.fields.lead)));

    var row = el("div", "btn-row");
    [
      ["primary button", "btn btn-primary"],
      ["secondary button", "btn btn-ghost"],
    ].forEach(function (pair) {
      var link = linkField(section.fields[pair[0]]);
      if (!link) return;
      var a = el("a", pair[1], inline(link.label));
      a.href = link.href;
      row.appendChild(a);
    });
    left.appendChild(row);
    grid.appendChild(left);

    var portrait = el("div", "portrait");
    var frame = el("div", "portrait-frame");
    frame.setAttribute("aria-hidden", "true");
    portrait.appendChild(frame);
    var img = el("img");
    img.src = section.fields.portrait;
    img.alt = document.title;
    portrait.appendChild(img);
    grid.appendChild(portrait);
    node.appendChild(grid);

    if (section.fields["scroll hint"]) {
      var hint = el("a", "scroll-hint", inline(section.fields["scroll hint"]));
      hint.href = "#s-about";
      hint.appendChild(el("span", null, "↓"));
      node.appendChild(hint);
    }
    return node;
  }

  function toBinary(text) {
    var source = "Im " + text.replace(/\s*\/\s*/g, " ") + ", software engineer";
    var out = [];
    for (var i = 0; i < source.length; i++) {
      var bytes = unescape(encodeURIComponent(source[i]));
      for (var b = 0; b < bytes.length; b++) {
        out.push(("00000000" + bytes.charCodeAt(b).toString(2)).slice(-8));
      }
    }
    return out.join(" ");
  }

  function renderAbout(section) {
    var node = sectionShell("about", section, "section-paned");
    var pane = el("div", "cv-pane");
    var wrap = el("div", "wrap split");
    wrap.appendChild(sideHead(section, false));

    var body = el("div");
    if (section.fields.lead) {
      body.appendChild(el("p", "about-lead", inline(section.fields.lead)));
    }
    if (section.fields.body) {
      body.appendChild(el("p", "body-dark", inline(section.fields.body)));
    }

    var numbers = subByTitle(section, "Numbers");
    if (numbers && numbers.tables[0]) {
      var grid = el("div", "stat-grid");
      numbers.tables[0].forEach(function (row) {
        var stat = el("div", "stat");
        stat.appendChild(el("div", "stat-num", inline(row.figure)));
        stat.appendChild(el("div", "stat-label", inline(row.label)));
        grid.appendChild(stat);
      });
      body.appendChild(grid);
    }

    var cols = el("div", "about-cols");
    var education = subByTitle(section, "Education");
    if (education && education.tables[0]) {
      var eduCol = el("div");
      eduCol.appendChild(el("div", "col-label mono", inline(education.title)));
      var list = el("div", "edu-list");
      education.tables[0].forEach(function (row) {
        var item = el("div", "edu-row");
        item.appendChild(el("span", "edu-when mono", inline(row.years)));
        var text = el("div");
        text.appendChild(el("div", "edu-title", inline(row.title)));
        text.appendChild(el("div", "edu-sub", inline(row.institution)));
        item.appendChild(text);
        list.appendChild(item);
      });
      eduCol.appendChild(list);
      cols.appendChild(eduCol);
    }

    var languages = subByTitle(section, "Languages");
    if (languages && languages.tables[0]) {
      var stack = el("div", "about-col-stack");
      var langCol = el("div");
      langCol.appendChild(el("div", "col-label mono", inline(languages.title)));
      var pills = el("div", "lang-list");
      languages.tables[0].forEach(function (row) {
        pills.appendChild(
          el(
            "span",
            "lang",
            inline(row.language) + " <span>" + inline(row.level) + "</span>"
          )
        );
      });
      langCol.appendChild(pills);
      stack.appendChild(langCol);
      cols.appendChild(stack);
    }

    body.appendChild(cols);
    wrap.appendChild(body);
    pane.appendChild(wrap);
    node.appendChild(pane);
    return node;
  }

  function subByTitle(section, title) {
    return CVParse.byTitle(section ? section.subs : [], title);
  }

  function bulletList(items) {
    var ul = el("ul");
    items.forEach(function (text) {
      ul.appendChild(el("li", null, inline(text)));
    });
    return ul;
  }

  function renderExperience(section) {
    var node = sectionShell("experience", section, "section-paned");
    var pane = el("div", "cv-pane");
    var wrap = el("div", "wrap split");

    var head = sideHead(section, true);
    var note = head.querySelector(".side-note");
    if (note) note.classList.add("mono");
    wrap.appendChild(head);

    window.CV_LABELS = {
      expand: section.fields["expand label"] || "",
      collapse: section.fields["collapse label"] || "",
    };

    var timeline = el("div", "timeline");
    section.subs.forEach(function (entry, index) {
      if (entry.depth !== 3) return;
      var item = el("div", "tl-item");
      item.appendChild(
        el(
          "div",
          "tl-when mono",
          titleLines(entry.fields.period)
            .map(function (part, i) {
              return i === 1 ? "<span>" + part + "</span>" : part;
            })
            .join("<br />")
        )
      );

      var body = el("div", "tl-body");
      /* Collapsible: yes → starts closed. expanded (or open) → starts open. */
      var collapse = (entry.fields.collapsible || "").toLowerCase();
      var collapsible = collapse === "yes" || collapse === "expanded" || collapse === "open";
      var startsOpen = collapse === "expanded" || collapse === "open";
      var key = "exp" + index;

      var heading = el("h3", null, inline(entry.title));
      var meta = el("div", "tl-meta", inline(entry.fields.meta));

      if (collapsible) {
        var headRow = el("div", "exp-head");
        headRow.setAttribute("data-exp-head", key);
        headRow.setAttribute("role", "button");
        headRow.setAttribute("tabindex", "0");
        headRow.setAttribute("aria-expanded", String(startsOpen));
        headRow.setAttribute("aria-controls", key);
        var titleBox = el("div");
        titleBox.appendChild(heading);
        titleBox.appendChild(meta);
        headRow.appendChild(titleBox);
        var toggleLabel = startsOpen
          ? section.fields["collapse label"]
          : section.fields["expand label"];
        if (toggleLabel) {
          var toggle = el("span", "exp-toggle mono", inline(toggleLabel));
          toggle.setAttribute("data-exp-chev", key);
          headRow.appendChild(toggle);
        }
        body.appendChild(headRow);
      } else {
        body.appendChild(heading);
        body.appendChild(meta);
      }

      var content = collapsible ? el("div", "exp-body") : body;
      if (collapsible) {
        content.id = key;
        content.setAttribute("data-exp-body", key);
        content.hidden = !startsOpen;
      }

      if (entry.fields.summary) {
        content.appendChild(el("p", null, inline(entry.fields.summary)));
      }
      if (entry.fields.roles) {
        var roles = el("div", "tl-roles mono");
        entry.fields.roles.split("|").forEach(function (role) {
          roles.appendChild(el("span", null, inline(role.trim())));
        });
        content.appendChild(roles);
      }
      if (entry.bullets.length) content.appendChild(bulletList(entry.bullets));

      var link = linkField(entry.fields.link);
      if (link && link.href) {
        var a = el("a", "inline-link mono", inline(link.label) + " →");
        externalAttrs(a, link.href);
        content.appendChild(a);
      }

      if (entry.fields["engagements label"]) {
        var divider = el("div", "tl-divider");
        divider.appendChild(
          el("span", "mono", inline(entry.fields["engagements label"]))
        );
        divider.appendChild(el("span", "tl-divider-line"));
        content.appendChild(divider);
      }

      entry.subs.forEach(function (engagement) {
        var card = el("div", "engagement");
        var cardHead = el("div", "engagement-head");
        cardHead.appendChild(el("h4", null, inline(engagement.title)));
        cardHead.appendChild(el("span", "mono", inline(engagement.fields.meta)));
        card.appendChild(cardHead);
        if (engagement.bullets.length) {
          card.appendChild(bulletList(engagement.bullets));
        }
        content.appendChild(card);
      });

      if (collapsible) body.appendChild(content);
      item.appendChild(body);
      timeline.appendChild(item);
    });

    wrap.appendChild(timeline);
    pane.appendChild(wrap);
    node.appendChild(pane);
    return node;
  }

  function renderCompetencies(section) {
    var node = sectionShell("competencies", section, "section-paned");
    var pane = el("div", "cv-pane");
    var wrap = el("div", "wrap split");
    wrap.appendChild(sideHead(section, true));

    var right = el("div");
    var cardsTable = subByTitle(section, "Cards");
    if (cardsTable && cardsTable.tables[0]) {
      var cards = el("div", "skill-cards");
      cardsTable.tables[0].forEach(function (row) {
        var card = el("article", "skill-card");
        card.appendChild(el("div", "skill-num mono", inline(row["#"])));
        card.appendChild(el("h3", null, inline(row.title)));
        card.appendChild(el("p", null, inline(row.description)));
        card.appendChild(tagList(row.tags));
        cards.appendChild(card);
      });
      right.appendChild(cards);
    }

    var rowsTable = subByTitle(section, "Tag rows");
    if (rowsTable && rowsTable.tables[0]) {
      var rows = el("div", "tag-rows");
      rowsTable.tables[0].forEach(function (row) {
        var tagRow = el("div", "tag-row");
        tagRow.appendChild(el("span", "tag-row-label mono", inline(row.label)));
        tagRow.appendChild(tagList(row.tags));
        rows.appendChild(tagRow);
      });
      right.appendChild(rows);
    }

    wrap.appendChild(right);
    pane.appendChild(wrap);
    node.appendChild(pane);
    return node;
  }

  function tagList(value) {
    var list = el("div", "tags");
    String(value || "")
      .split("·")
      .forEach(function (tag) {
        if (tag.trim()) list.appendChild(el("span", "tag mono", inline(tag.trim())));
      });
    return list;
  }

  function renderProjects(section) {
    var node = sectionShell("projects", section, "section-paned");
    var pane = el("div", "cv-pane");
    var wrap = el("div", "wrap split");
    wrap.appendChild(sideHead(section, true));

    var list = el("div", "projects");
    (section.tables[0] || []).forEach(function (row) {
      var card = el("article", "project");
      var head = el("div", "project-head");
      var left = el("div");
      left.appendChild(el("div", "project-num mono", inline(row["#"])));
      left.appendChild(el("h3", null, inline(row.project)));
      head.appendChild(left);
      if (row.status) {
        head.appendChild(el("span", "project-status mono", inline(row.status)));
      }
      card.appendChild(head);
      card.appendChild(el("p", null, inline(row.description)));
      if (row.stack) card.appendChild(el("div", "project-stack mono", inline(row.stack)));
      if (row.link && section.fields["link label"]) {
        var a = el("a", "inline-link mono", inline(section.fields["link label"]) + " →");
        externalAttrs(a, row.link);
        card.appendChild(a);
      }
      list.appendChild(card);
    });

    wrap.appendChild(list);
    pane.appendChild(wrap);
    node.appendChild(pane);
    return node;
  }

  function renderGames(section) {
    var node = sectionShell("games", section, "section-games");

    var headWrap = el("div", "wrap");
    var head = el("div", "games-head");
    head.appendChild(sideHead(section, true));
    var link = linkField(section.fields.link);
    if (link && link.href) {
      var a = el("a", "mono inline-link", inline(link.label) + " →");
      externalAttrs(a, link.href);
      head.appendChild(a);
    }
    headWrap.appendChild(head);
    node.appendChild(headWrap);

    var rail = el("div", "cv-rail");
    var track = el("div", "game-track");
    var games = section.tables[0] || [];
    games.forEach(function (row) {
      var card = el("a", "game-card");
      externalAttrs(card, row.link);

      var cover = el("span", "game-cover");
      var img = el("img");
      img.src = "assets/images/" + row.image;
      img.alt = row.game;
      img.loading = "lazy";
      cover.appendChild(img);
      cover.appendChild(el("span", "game-num mono", inline(row["#"])));
      if (row.year) cover.appendChild(el("span", "game-year mono", inline(row.year)));
      if (
        (row.featured || "").toLowerCase() === "yes" &&
        section.fields["featured label"]
      ) {
        cover.appendChild(
          el("span", "game-badge mono", inline(section.fields["featured label"]))
        );
      }
      card.appendChild(cover);

      var caption = el("span", "game-caption");
      caption.appendChild(el("span", "game-name", inline(row.game)));
      caption.appendChild(el("span", "game-sub mono", inline(row.subtitle)));
      caption.appendChild(el("span", "game-tech mono", inline(row.tech)));
      card.appendChild(caption);
      track.appendChild(card);
    });
    rail.appendChild(track);
    node.appendChild(rail);

    if (section.fields.hint) {
      var hintWrap = el("div", "wrap");
      hintWrap.appendChild(
        el(
          "span",
          "rail-hint mono",
          inline(section.fields.hint.replace("{count}", games.length))
        )
      );
      node.appendChild(hintWrap);
    }
    return node;
  }

  function renderContact(section) {
    var node = sectionShell("contact", section, "section-contact");
    var grid = el("div", "wrap contact-grid");

    var left = el("div");
    left.appendChild(
      el(
        "h2",
        "contact-title",
        titleLines(section.fields.heading).join("<br />")
      )
    );
    left.appendChild(el("span", "rule"));
    left.appendChild(el("p", "body-dark", inline(section.fields.body)));
    var button = linkField(section.fields.button);
    if (button && button.href) {
      var cta = el("a", "btn btn-primary", inline(button.label));
      /* cv.html builds the PDF from this same file; ?print=1 opens the
         browser's save-as-PDF dialog on arrival. */
      var isCv = /cv\.html$/.test(button.href);
      cta.href = isCv ? button.href + "?print=1" : button.href;
      cta.target = "_blank";
      cta.rel = "noopener noreferrer";
      left.appendChild(cta);
    }
    grid.appendChild(left);

    var list = el("div", "contact-list");
    (section.tables[0] || [])
      .filter(function (row) {
        /* A link to this very site belongs on the CV, not on the site. */
        return (row["cv only"] || "").toLowerCase() !== "yes";
      })
      .forEach(function (row) {
      var item = row.link ? el("a") : el("div", "contact-row");
      if (row.link) externalAttrs(item, row.link);
      item.appendChild(el("span", "mono contact-key", inline(row.key)));
      item.appendChild(el("span", "contact-val", inline(row.value)));
        list.appendChild(item);
      });
    grid.appendChild(list);
    node.appendChild(grid);

    var footer = el("div", "footer");
    footer.appendChild(el("span", "mono", inline(section.fields["footer left"])));
    var version = el("span", "mono footer-version");
    footer.appendChild(version);
    CVParse.loadVersion().then(function (info) {
      version.textContent = CVParse.versionText(info, section.fields["version label"]);
    });
    footer.appendChild(el("span", "mono", inline(section.fields["footer right"])));
    node.appendChild(footer);
    return node;
  }

  /* ----------------------------------------------------------------- boot */

  var RENDERERS = {
    home: renderHome,
    about: renderAbout,
    experience: renderExperience,
    competencies: renderCompetencies,
    projects: renderProjects,
    games: renderGames,
    contact: renderContact,
  };

  function build(doc) {
    var byKey = {};
    doc.sections.forEach(function (s) {
      byKey[s.title.toLowerCase()] = s;
    });

    var meta = byKey.meta || { fields: {} };
    if (meta.fields.title) document.title = meta.fields.title;
    setMeta("description", meta.fields.description);
    setMeta("author", meta.fields.author);
    setMeta("theme-color", meta.fields["theme color"]);
    if (meta.fields.favicon) {
      var icon = document.querySelector('link[rel="shortcut icon"]');
      if (icon) icon.href = meta.fields.favicon;
    }

    var root = document.getElementById("cv-scroll");
    var nav = byKey.nav || { fields: {} };
    root.appendChild(topbar(doc, byKey, nav));
    root.appendChild(dots(doc));

    Object.keys(RENDERERS).forEach(function (key) {
      var section = byKey[key];
      if (section) root.appendChild(RENDERERS[key](section));
    });
  }

  function setMeta(name, value) {
    if (!value) return;
    var tag = document.querySelector('meta[name="' + name + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", value);
  }

  /* Sections carrying a "Nav label" become the nav and the scroll dots. */
  function navSections(doc) {
    return doc.sections.filter(function (s) {
      return s.fields["nav label"];
    });
  }

  function topbar(doc, byKey, nav) {
    var bar = el("div", "topbar");
    var inner = el("div", "topbar-inner");
    var brand = el("a", "brand", inline(nav.fields.brand || ""));
    brand.href = "#s-home";
    inner.appendChild(brand);

    var links = el("nav", "nav-links");
    navSections(doc).forEach(function (section) {
      var key = section.title.toLowerCase();
      var a = el("a", null, inline(section.fields["nav label"]));
      a.href = "#" + SECTION_ID[key];
      if (key === "contact") a.className = "btn btn-primary btn-sm";
      links.appendChild(a);
    });
    inner.appendChild(links);
    bar.appendChild(inner);
    return bar;
  }

  function dots(doc) {
    var wrap = el("div", "dots");
    var keys = ["home"].concat(
      navSections(doc).map(function (s) {
        return s.title.toLowerCase();
      })
    );
    keys.forEach(function (key, i) {
      var id = SECTION_ID[key];
      if (!id) return;
      var dot = el("a", "dot" + (i === 0 ? " is-active" : ""));
      dot.href = "#" + id;
      dot.setAttribute("data-dot", id);
      dot.title = key;
      wrap.appendChild(dot);
    });
    return wrap;
  }

  function fail(message) {
    var root = document.getElementById("cv-scroll");
    root.innerHTML =
      '<div class="load-error"><h1>Content unavailable</h1><p>' +
      message +
      "</p></div>";
  }

  fetch("CONTENT.md", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (md) {
      build(parse(md));
      if (window.initSite) window.initSite();
    })
    .catch(function (err) {
      fail(
        "CONTENT.md could not be loaded (" + err.message +
        "). Opening index.html straight from the file system blocks this " +
        "request — serve the folder over HTTP instead."
      );
    });
})();
