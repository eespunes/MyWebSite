// Build v1.166 · 2026-11-10
/* The Spanish, Catalan and Dutch versions. Translations keep CONTENT.md's
   structure and change only the copy, so a section, entry or row added to
   one file and not the others fails here; the language folders must match
   what scripts/build-languages.js writes; and each version renders in a
   real browser, with the "also available in" hint offered to the right
   visitors. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ROOT, CVParse, doc: english, sections, plain } = require("./helpers/content.js");
const CVLang = require("../assets/js/lang.js");
const { render } = require("../scripts/build-languages.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const languages = CVLang.translations(english);
const others = languages.filter((l) => l.file !== "CONTENT.md");
const read = (file) => CVParse.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const folder = (lang) => lang.path.replace(/^\/+/, "");

/* Sections every translation carries in full; the rest (Translations, and
   the game pages' subs) come from CONTENT.md. */
const TRANSLATED = [
  "meta", "nav", "home", "about", "experience", "competencies",
  "projects", "games", "cv", "contact", "language",
];

/* Columns and fields that are data, not copy: identical in every version. */
const SAME_FIELDS = {
  meta: ["author", "theme color", "favicon"],
  home: ["portrait"],
  about: ["theme"],
  contact: ["theme", "footer left"],
};
const SAME_COLUMNS = {
  projects: ["#", "status", "link", "demo", "featured"],
  games: ["#", "year", "image", "link", "featured"],
  contact: ["link", "cv only"],
};
const target = (value) => String(value || "").split("→")[1]?.trim() || "";

test("the Translations table lists English at the root and a file per language", () => {
  assert.ok(languages.length >= 2, "no translations listed");
  const root = languages.filter((l) => folder(l) === "");
  assert.equal(root.length, 1, "exactly one language is served from /");
  assert.equal(root[0].file, "CONTENT.md");
  assert.equal(new Set(languages.map((l) => l.code)).size, languages.length, "codes repeat");
  for (const lang of others) {
    assert.match(lang.path, /^\/[a-z]{2}\/$/, `${lang.code} path should look like /xx/`);
    assert.ok(fs.existsSync(path.join(ROOT, lang.file)), `${lang.file} is missing`);
  }
});

test("the language folders are what build-languages.js writes", () => {
  for (const [rel, html] of Object.entries(render())) {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), `${rel} is missing — run npm run languages:build`);
    assert.equal(fs.readFileSync(file, "utf8"), html, `${rel} is out of date — run npm run languages:build`);
  }
});

for (const lang of others) {
  const own = CVParse.index(read(lang.file));
  const sub = (section, title) => CVParse.byTitle(section ? section.subs : [], title);

  test(`${lang.file} carries every translated section with the same fields`, () => {
    for (const name of TRANSLATED) {
      assert.ok(own[name], `${lang.file} is missing ## ${name}`);
      assert.deepEqual(
        Object.keys(own[name].fields).sort(),
        Object.keys(sections[name].fields).sort(),
        `${lang.file} › ${name} has different fields`
      );
    }
    for (const [name, fields] of Object.entries(SAME_FIELDS)) {
      for (const field of fields) {
        assert.equal(own[name].fields[field], sections[name].fields[field], `${lang.file} › ${name} › ${field}`);
      }
    }
    for (const field of ["primary button", "secondary button"]) {
      assert.equal(target(own.home.fields[field]), target(sections.home.fields[field]), `home › ${field} target`);
    }
    assert.equal(target(own.contact.fields.button), target(sections.contact.fields.button), "contact › button target");
    assert.equal(own.home.bullets.length, sections.home.bullets.length, "rotating specialisations");
  });

  test(`${lang.file} tables have the same columns, rows and data`, () => {
    const pairs = [
      ["about › Numbers", sub(sections.about, "Numbers"), sub(own.about, "Numbers")],
      ["about › Education", sub(sections.about, "Education"), sub(own.about, "Education")],
      ["about › Languages", sub(sections.about, "Languages"), sub(own.about, "Languages")],
      ["competencies › Cards", sub(sections.competencies, "Cards"), sub(own.competencies, "Cards")],
      ["competencies › Tag rows", sub(sections.competencies, "Tag rows"), sub(own.competencies, "Tag rows")],
      ["cv › Skill groups", sub(sections.cv, "Skill groups"), sub(own.cv, "Skill groups")],
      ["projects", sections.projects, own.projects],
      ["games", sections.games, own.games],
      ["contact", sections.contact, own.contact],
      ["language", sections.language, own.language],
    ];
    for (const [what, theirs, mine] of pairs) {
      assert.ok(mine && mine.tables[0], `${lang.file} › ${what} has no table`);
      const a = theirs.tables[0];
      const b = mine.tables[0];
      assert.equal(b.length, a.length, `${lang.file} › ${what} row count`);
      assert.deepEqual(Object.keys(b[0]), Object.keys(a[0]), `${lang.file} › ${what} columns`);
    }
    for (const [name, columns] of Object.entries(SAME_COLUMNS)) {
      sections[name].tables[0].forEach((row, i) => {
        for (const column of columns) {
          assert.equal(own[name].tables[0][i][column], row[column], `${lang.file} › ${name} row ${i + 1} › ${column}`);
        }
      });
    }
    const years = (s) => sub(s, "Education").tables[0].map((r) => r.years.replace(/\s*\([^)]*\)/, ""));
    assert.deepEqual(years(own.about), years(sections.about), "education years");
    const hasBadge = (s) => sub(s, "Education").tables[0].map((r) => /\(/.test(r.years));
    assert.deepEqual(hasBadge(own.about), hasBadge(sections.about), "education (expected) badges");
  });

  test(`${lang.file} has the same experience entries, engagements and bullets`, () => {
    const entries = (s) => s.subs.filter((e) => e.depth === 3);
    const theirs = entries(sections.experience);
    const mine = entries(own.experience);
    assert.equal(mine.length, theirs.length, "experience entries");
    theirs.forEach((entry, i) => {
      const other = mine[i];
      assert.deepEqual(Object.keys(other.fields).sort(), Object.keys(entry.fields).sort(), `${entry.title} fields`);
      assert.equal(other.fields.period, entry.fields.period, `${entry.title} period`);
      assert.equal(other.fields.collapsible, entry.fields.collapsible, `${entry.title} collapsible`);
      assert.equal(target(other.fields.link), target(entry.fields.link), `${entry.title} link`);
      assert.equal(other.bullets.length, entry.bullets.length, `${entry.title} bullets`);
      assert.deepEqual(other.subs.map((s) => s.title), entry.subs.map((s) => s.title), `${entry.title} engagements`);
      entry.subs.forEach((engagement, j) => {
        assert.equal(other.subs[j].bullets.length, engagement.bullets.length, `${engagement.title} bullets`);
      });
    });
  });
}

test("every version words the switcher and the hint, naming every language", () => {
  for (const lang of languages) {
    const own = CVParse.index(read(lang.file)).language;
    assert.ok(own, `${lang.file} has no ## Language`);
    for (const field of ["switcher label", "hint", "switch label", "stay label", "close label"]) {
      assert.ok(own.fields[field], `${lang.file} › Language is missing "${field}"`);
    }
    assert.match(own.fields["stay label"], /\{language\}/, `${lang.file} › Stay label needs {language}`);
    const named = own.tables[0].map((r) => r.code);
    assert.deepEqual(named.sort(), languages.map((l) => l.code).sort(), `${lang.file} names every language`);
  }
});

/* ------------------------------------------------------- who gets the hint */

test("the hint goes by country, and by browser language for Catalan", () => {
  const cases = [
    [{ timeZone: "Europe/Madrid", languages: ["en-GB"] }, "en", "es"],
    [{ timeZone: "Atlantic/Canary", languages: ["es-ES"] }, "en", "es"],
    [{ timeZone: "Europe/Madrid", languages: ["ca-ES", "es"] }, "en", "ca"],
    [{ timeZone: "Europe/Andorra", languages: ["en"] }, "en", "ca"],
    [{ timeZone: "Europe/Amsterdam", languages: ["en-US"] }, "en", "nl"],
    [{ timeZone: "Europe/Brussels", languages: ["nl-BE"] }, "en", "nl"],
    [{ timeZone: "America/Mexico_City", languages: ["es-MX"] }, "en", "es"],
    [{ timeZone: "America/Argentina/Cordoba", languages: ["es-AR"] }, "en", "es"],
    [{ timeZone: "", languages: ["nl-NL"] }, "en", "nl"],
    [{ timeZone: "Europe/Berlin", languages: ["ca"] }, "en", "ca"],
    [{ timeZone: "Europe/Berlin", languages: ["de-DE"] }, "en", null],
    [{ timeZone: "America/New_York", languages: ["en-US"] }, "en", null],
    [{ timeZone: "Europe/Madrid", languages: ["es-ES"] }, "es", null],
    [{ timeZone: "Europe/Amsterdam", languages: ["nl"] }, "es", "nl"],
  ];
  for (const [env, current, expected] of cases) {
    assert.equal(CVLang.pick(env, languages, current), expected, `${JSON.stringify(env)} on ${current}`);
  }
});

/* ------------------------------------------------------------ in a browser */

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

const SITE = `JSON.stringify({
  lang: document.documentElement.lang,
  nav: Array.from(document.querySelectorAll('.nav-links a')).map(a => a.textContent.trim()),
  aboutLead: document.querySelector('.about-lead')?.textContent.replace(/\\s+/g,' ').trim(),
  colLabels: Array.from(document.querySelectorAll('#s-about .col-label')).map(l => l.textContent.trim()),
  switcher: Array.from(document.querySelectorAll('.topbar .lang-switch a')).map(a => ({
    code: a.textContent.trim(), href: a.href, current: a.hasAttribute('aria-current') })),
  portrait: document.querySelector('.portrait img').src,
  game: document.querySelector('.game-card').href,
  demo: document.querySelector('a.project-demo')?.href || '',
  cv: document.querySelector('#s-contact .btn-primary').href,
  privacy: document.querySelector('.footer a').textContent.trim(),
})`;

const CV = `JSON.stringify({
  lang: document.documentElement.lang,
  back: document.querySelector('.cv-back').textContent.trim(),
  save: document.querySelector('.cv-save').textContent.trim(),
  switcher: Array.from(document.querySelectorAll('.lang-switch a')).map(a => ({
    code: a.textContent.trim(), href: a.href, current: a.hasAttribute('aria-current') })),
  badge: document.querySelector('.cv-badge')?.textContent.trim() || '',
  labels: Array.from(document.querySelectorAll('.cv-contact-label')).map(l => l.textContent.trim()),
  foot: Array.from(document.querySelectorAll('.cv-foot-contacts a')).map(a => a.getAttribute('href')),
})`;

for (const lang of languages) {
  const own = CVParse.index(CVLang.merge(english, read(lang.file)));
  const base = (rel) => `/${folder(lang)}${rel}`;

  browserTest(`${lang.code}: the site renders from ${lang.file}`, async () => {
    const { value, errors } = await evaluateOn(`${folder(lang)}index.html`, SITE);
    const page = JSON.parse(value);
    assert.deepEqual(errors, []);
    assert.equal(page.lang, lang.code);
    const expectedNav = english.sections
      .filter((s) => s.fields["nav label"])
      .map((s) => plain(own[s.title.toLowerCase()].fields["nav label"]));
    assert.deepEqual(page.nav, expectedNav);
    assert.equal(page.aboutLead, plain(own.about.fields.lead));
    const sub = (title) => CVParse.byTitle(own.about.subs, title);
    assert.deepEqual(page.colLabels, [
      sub("Education").fields.label || "Education",
      sub("Languages").fields.label || "Languages",
    ]);
    assert.equal(page.privacy, plain(own.contact.fields["privacy label"]));

    /* Everything but the pages themselves lives once, at the root. */
    assert.match(page.portrait, /\/assets\/images\/avatar\.jpg$/);
    assert.doesNotMatch(page.portrait, /\/[a-z]{2}\/assets\//);
    assert.match(page.game, /:\d+\/games\/kart-online\/$/);
    if (page.demo) assert.match(page.demo, /:\d+\/projects\/[a-z]+\/$/);
    assert.ok(new URL(page.cv).pathname.endsWith(base("cv.html")), `${page.cv} should stay in ${lang.path}`);

    assert.deepEqual(page.switcher.map((s) => s.code), languages.map((l) => l.code.toUpperCase()));
    assert.deepEqual(page.switcher.filter((s) => s.current).map((s) => s.code), [lang.code.toUpperCase()]);
    page.switcher.forEach((s, i) => {
      assert.equal(new URL(s.href).pathname, `/${folder(languages[i])}`, `${s.code} link`);
    });
  });

  browserTest(`${lang.code}: the CV renders from ${lang.file}`, async () => {
    const { value, errors } = await evaluateOn(`${folder(lang)}cv.html`, CV);
    const page = JSON.parse(value);
    assert.deepEqual(errors, []);
    assert.equal(page.lang, lang.code);
    assert.equal(page.back, plain(own.cv.fields["back label"]));
    assert.equal(page.save, plain(own.cv.fields["save label"]));
    const years = CVParse.byTitle(own.about.subs, "Education").tables[0].map((r) => r.years).join(" ");
    assert.equal(page.badge, (years.match(/\(([^)]+)\)/) || [, ""])[1]);
    const location = own.contact.tables[0].find((r) => !r.link && r.value === own.contact.fields.location);
    assert.ok(page.labels.includes(location.key), `contact labels ${page.labels} lack ${location.key}`);
    assert.deepEqual(page.foot.map((h) => h.split(":")[0]), ["mailto", "tel", "https"]);
    assert.deepEqual(page.switcher.filter((s) => s.current).map((s) => s.code), [lang.code.toUpperCase()]);
    page.switcher.forEach((s, i) => {
      assert.equal(new URL(s.href).pathname, `/${folder(languages[i])}cv.html`, `${s.code} link`);
    });
  });
}

/* Waits for the hint, which appears once the offered language's file loads. */
const HINT = `new Promise((resolve) => {
  const started = Date.now();
  (function look() {
    const card = document.querySelector('.lang-hint');
    if (card || Date.now() - started > 3000) {
      resolve(JSON.stringify(card ? {
        lang: card.lang,
        code: card.querySelector('.lang-hint-code').textContent.trim(),
        name: card.querySelector('.lang-hint-name').textContent.trim(),
        text: card.querySelector('.lang-hint-text').textContent.trim(),
        go: card.querySelector('.btn-primary').textContent.trim(),
        href: new URL(card.querySelector('.btn-primary').href).pathname,
        stay: card.querySelector('.lang-hint-stay')?.textContent.trim() || '',
      } : null));
    } else setTimeout(look, 100);
  })();
})`;

const copy = (code) => CVParse.index(read(languages.find((l) => l.code === code).file)).language;
const nameIn = (code, of) => copy(code).tables[0].find((r) => r.code === of).name;

const HINTS = [
  ["index.html", { timeZone: "Europe/Amsterdam" }, "en", "nl"],
  ["index.html", { timeZone: "Europe/Madrid", languages: ["en-GB"] }, "en", "es"],
  ["index.html", { timeZone: "Europe/Madrid", languages: ["ca-ES", "es"] }, "en", "ca"],
  ["es/index.html", { timeZone: "Europe/Amsterdam" }, "es", "nl"],
  ["index.html", { timeZone: "Europe/Berlin", languages: ["de-DE"] }, "en", null],
  ["nl/index.html", { timeZone: "Europe/Amsterdam" }, "nl", null],
];

for (const [page, visitor, current, offered] of HINTS) {
  browserTest(`hint on ${page} for ${JSON.stringify(visitor)}: ${offered || "none"}`, async () => {
    const { value, errors } = await evaluateOn(page, HINT, visitor);
    const hint = JSON.parse(value);
    assert.deepEqual(errors, []);
    if (!offered) {
      assert.equal(hint, null);
      return;
    }
    const lang = languages.find((l) => l.code === offered);
    const words = copy(offered);
    assert.equal(hint.lang, offered);
    assert.equal(hint.code, offered.toUpperCase());
    assert.equal(hint.name, lang.name);
    assert.equal(hint.text, words.fields.hint);
    assert.equal(hint.go, `${words.fields["switch label"]} →`);
    assert.equal(hint.href, `/${folder(lang)}`);
    assert.equal(hint.stay, words.fields["stay label"].replace("{language}", nameIn(offered, current)));
  });
}
