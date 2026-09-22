// Build v1.91 · 2026-09-22
/* Schema checks on CONTENT.md — fast, no browser. These guard the contract
   the renderers rely on: if a category or column is renamed here without the
   renderers following, the page silently loses content. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { sections, sub } = require("./helpers/content.js");

const REQUIRED_SECTIONS = [
  "meta", "nav", "home", "about", "experience",
  "competencies", "projects", "games", "cv", "contact",
];

const REQUIRED_FIELDS = {
  meta: ["title", "description", "favicon"],
  nav: ["brand"],
  home: ["eyebrow", "name", "portrait", "lead", "primary button", "secondary button"],
  about: ["title", "lead", "body", "nav label"],
  experience: ["title", "side note", "nav label", "expand label", "collapse label"],
  competencies: ["title", "side note", "nav label"],
  projects: ["title", "side note", "nav label", "link label"],
  games: ["title", "side note", "link", "hint", "nav label", "featured label"],
  cv: ["role", "competencies label", "education label", "experience label",
       "projects label", "engagement label", "online label", "languages label",
       "back label", "save label"],
  contact: ["heading", "body", "button", "location", "footer left", "footer right"],
};

const REQUIRED_TABLES = {
  about: { Numbers: ["figure", "label"],
           Education: ["years", "title", "institution"],
           Languages: ["language", "level"] },
  competencies: { Cards: ["#", "title", "description", "tags"],
                  "Tag rows": ["label", "tags"] },
  cv: { "Skill groups": ["group", "tags"] },
};

test("every section the renderers expect is present", () => {
  for (const name of REQUIRED_SECTIONS) {
    assert.ok(sections[name], `CONTENT.md is missing the "${name}" section`);
  }
});

test("sections carry the fields the renderers read", () => {
  for (const [name, fields] of Object.entries(REQUIRED_FIELDS)) {
    for (const field of fields) {
      const value = sections[name].fields[field];
      assert.ok(value && value.length, `${name} is missing "${field}"`);
    }
  }
});

test("sub-tables use the expected column names", () => {
  for (const [name, tables] of Object.entries(REQUIRED_TABLES)) {
    for (const [title, columns] of Object.entries(tables)) {
      const found = sub(sections[name], title);
      assert.ok(found, `${name} is missing the "${title}" table`);
      const rows = found.tables[0];
      assert.ok(rows && rows.length, `${name} › ${title} has no rows`);
      for (const column of columns) {
        assert.ok(column in rows[0], `${name} › ${title} is missing column "${column}"`);
      }
    }
  }
});

test("top-level tables use the expected column names", () => {
  const projects = sections.projects.tables[0];
  assert.ok(projects?.length, "Projects has no rows");
  for (const column of ["#", "project", "status", "description", "stack", "link"]) {
    assert.ok(column in projects[0], `Projects is missing column "${column}"`);
  }

  const games = sections.games.tables[0];
  assert.ok(games?.length, "Games has no rows");
  for (const column of ["#", "game", "subtitle", "tech", "year", "image", "link", "featured"]) {
    assert.ok(column in games[0], `Games is missing column "${column}"`);
  }

  const contact = sections.contact.tables[0];
  assert.ok(contact?.length, "Contact has no rows");
  for (const column of ["key", "value", "link"]) {
    assert.ok(column in contact[0], `Contact is missing column "${column}"`);
  }
});

test("experience entries carry a period, meta and bullets", () => {
  const entries = sections.experience.subs.filter((s) => s.depth === 3);
  assert.ok(entries.length, "Experience has no entries");
  for (const entry of entries) {
    assert.ok(entry.fields.period, `${entry.title} has no Period`);
    assert.ok(entry.fields.meta, `${entry.title} has no Meta`);
    const ownBullets = entry.bullets.length;
    const engagementBullets = entry.subs.reduce((n, s) => n + s.bullets.length, 0);
    assert.ok(
      ownBullets + engagementBullets > 0,
      `${entry.title} has neither bullets nor an engagement with bullets`
    );
  }
});

test("linked rows point at real targets", () => {
  const rows = [
    ...sections.games.tables[0].map((r) => ({ what: `game ${r.game}`, link: r.link })),
    ...sections.projects.tables[0].map((r) => ({ what: `project ${r.project}`, link: r.link })),
  ].filter((r) => r.link);
  assert.ok(rows.length, "no linked rows found");
  for (const row of rows) {
    assert.match(row.link, /^https?:\/\//, `${row.what} has a malformed link`);
  }
});

test("games are listed newest first", () => {
  const rows = sections.games.tables[0];
  const years = rows.map((r) => r.year.trim());

  /* Rows without a year sort last; the rest run newest to oldest. */
  const dated = years.filter((y) => y);
  const undatedFirst = years.findIndex((y) => !y);
  if (undatedFirst !== -1) {
    assert.ok(
      years.slice(undatedFirst).every((y) => !y),
      "games without a year must all be at the end"
    );
  }
  for (let i = 1; i < dated.length; i++) {
    assert.ok(
      Number(dated[i - 1]) >= Number(dated[i]),
      `${rows[i].game} (${dated[i]}) comes after ${rows[i - 1].game} (${dated[i - 1]})`
    );
  }
});

test("game numbering is sequential from 01", () => {
  sections.games.tables[0].forEach((row, i) => {
    assert.equal(row["#"], String(i + 1).padStart(2, "0"), `${row.game} is numbered ${row["#"]}`);
  });
});

test("every game image exists on disk", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const { ROOT } = require("./helpers/content.js");
  for (const row of sections.games.tables[0]) {
    const file = path.join(ROOT, "assets", "images", row.image);
    assert.ok(fs.existsSync(file), `missing image for ${row.game}: ${row.image}`);
  }
});
