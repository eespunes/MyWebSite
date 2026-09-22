// Build v1.85 · 2026-09-22
/* The CONTENT.md reader shared by the site (content.js) and the CV (cv.js),
   so both — and the tests — read the file exactly the same way.

   Shape: [{ title, fields, bullets, paragraphs, tables, subs }]
     `## Section`      → a section
     `### / #### Sub`  → nested subs (depth 3 / 4)
     `- Key: value`    → fields, keyed lowercase
     `* item`          → bullets
     `| a | b |`       → tables, rows keyed by the lowercased header row */
(function (root) {
  "use strict";

  function cells(row) {
    return row
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(function (c) {
        return c.trim();
      });
  }

  function readTable(rows) {
    var head = cells(rows[0]).map(function (h) {
      return h.toLowerCase();
    });
    var out = [];
    for (var i = 2; i < rows.length; i++) {
      var values = cells(rows[i]);
      var record = {};
      head.forEach(function (key, n) {
        record[key] = values[n] === undefined ? "" : values[n];
      });
      out.push(record);
    }
    return out;
  }

  function blank(title) {
    return {
      title: title,
      fields: {},
      bullets: [],
      paragraphs: [],
      tables: [],
      subs: [],
    };
  }

  function parse(md) {
    var lines = String(md).replace(/\r\n/g, "\n").split("\n");
    var sections = [];
    var section = null;
    var sub = null;

    function target() {
      return sub || section;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();

      if (/^##\s+/.test(line) && !/^###/.test(line)) {
        section = blank(line.replace(/^##\s+/, ""));
        sections.push(section);
        sub = null;
        continue;
      }
      if (!section) continue;

      if (/^####\s+/.test(line)) {
        sub = blank(line.replace(/^####\s+/, ""));
        sub.depth = 4;
        (section.subs[section.subs.length - 1] || section).subs.push(sub);
        continue;
      }
      if (/^###\s+/.test(line)) {
        sub = blank(line.replace(/^###\s+/, ""));
        sub.depth = 3;
        section.subs.push(sub);
        continue;
      }
      if (/^\|/.test(line)) {
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(lines[i].trim());
          i++;
        }
        i--;
        target().tables.push(readTable(rows));
        continue;
      }

      var field = line.match(/^-\s+([^:]+):\s*(.*)$/);
      if (field) {
        target().fields[field[1].trim().toLowerCase()] = field[2].trim();
        continue;
      }
      if (/^\*\s+/.test(line)) {
        target().bullets.push(line.replace(/^\*\s+/, ""));
        continue;
      }
      if (line) {
        var labelled = line.match(/^([A-Z][A-Za-z ]{2,20}):\s+(.*)$/);
        if (labelled) {
          target().fields[labelled[1].trim().toLowerCase()] = labelled[2].trim();
        } else {
          target().paragraphs.push(line);
        }
      }
    }
    return { sections: sections };
  }

  /* Convenience lookups shared by both renderers. */
  function byTitle(list, title) {
    var found = null;
    (list || []).forEach(function (item) {
      if (item.title.toLowerCase() === String(title).toLowerCase()) found = item;
    });
    return found;
  }

  function index(doc) {
    var map = {};
    doc.sections.forEach(function (s) {
      map[s.title.toLowerCase()] = s;
    });
    return map;
  }

  /* version.json is written from git history by scripts/version.js. The
     surfaces show nothing if it is absent, so a checkout without it still
     renders cleanly. */
  function loadVersion() {
    if (typeof fetch !== "function") return Promise.resolve(null);
    return fetch("version.json", { cache: "no-cache" })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  /* Only the commit count is shown: a pre-commit hook cannot know the sha of
     the commit it is writing, and a stamp that changed shape depending on how
     it was generated would be worse than no sha at all. */
  function versionText(info, label) {
    if (!info || !info.version || !label) return "";
    return label + " " + info.version;
  }

  var api = {
    parse: parse,
    byTitle: byTitle,
    index: index,
    loadVersion: loadVersion,
    versionText: versionText,
  };
  root.CVParse = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
