// Build v1.153 · 2026-11-06
/* The game pages: every game in CONTENT.md has a page, its builds, details
   and description, and the page shows what CONTENT.md says. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { sections, sub, plain, ROOT } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const games = sections.games;
const rows = games.tables[0];
const slugOf = (link) => link.replace(/\/+$/, "").split("/").pop();
const slugs = rows.map((r) => slugOf(r.link));
const builds = sub(games, "Game builds").tables[0];
const details = sub(games, "Game details").tables[0];
const descriptions = sub(games, "Game descriptions").subs;
const steps = sub(games, "Install steps").subs;
const PLATFORMS = ["Web", "Windows", "macOS", "Linux", "Android"];

test("every game has a generated page", () => {
  for (const slug of slugs) {
    const file = path.join(ROOT, "games", slug, "index.html");
    assert.ok(fs.existsSync(file), `games/${slug}/index.html is missing; run npm run games:build`);
    assert.match(fs.readFileSync(file, "utf8"), new RegExp(`data-slug="${slug}"`));
  }
});

test("builds, details and descriptions only name known games", () => {
  for (const row of [...builds, ...details]) assert.ok(slugs.includes(row.game), `unknown game ${row.game}`);
  for (const d of descriptions) assert.ok(slugs.includes(d.title), `unknown description ${d.title}`);
});

test("every game has a build, details and a description", () => {
  for (const slug of slugs) {
    assert.ok(builds.some((b) => b.game === slug), `${slug} has no build`);
    assert.equal(details.filter((d) => d.game === slug).length, 1, `${slug} needs one details row`);
    const d = descriptions.find((x) => x.title === slug);
    assert.ok(d && d.paragraphs.length, `${slug} has no description`);
  }
});

test("builds name a known platform, with install steps for every download", () => {
  for (const b of builds) {
    assert.ok(PLATFORMS.includes(b.platform), `${b.game}: unknown platform ${b.platform}`);
    if (b.platform === "Web") {
      assert.equal(b.source, `games/${b.game}/build/`, `${b.game}: web builds live in games/<slug>/build/`);
    } else {
      assert.ok(b.file && b.size, `${b.game}: download needs a file and a size`);
      assert.ok(!b.source || /^https:\/\//.test(b.source), `${b.game}: download Source must be an https URL`);
      assert.ok(steps.some((s) => s.title === b.platform && s.bullets.length), `no install steps for ${b.platform}`);
    }
  }
  for (const slug of slugs) {
    assert.ok(builds.filter((b) => b.game === slug && b.platform === "Web").length <= 1, `${slug}: one web build at most`);
  }
});

test("every web build on the site is a complete Unity export", () => {
  for (const b of builds.filter((x) => x.platform === "Web")) {
    const page = path.join(ROOT, b.source, "index.html");
    if (!fs.existsSync(page)) continue;
    const html = fs.readFileSync(page, "utf8");
    const json = (html.match(/instantiate\(\s*"[^"]+"\s*,\s*"([^"]+\.json)"/) || [])[1];
    assert.ok(json, `${b.game}: index.html does not start a Unity build`);
    const file = path.join(ROOT, b.source, json);
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const key of ["dataUrl", "wasmCodeUrl", "wasmFrameworkUrl", "asmCodeUrl", "asmFrameworkUrl", "asmMemoryUrl"]) {
      if (manifest[key]) assert.ok(fs.existsSync(path.join(path.dirname(file), manifest[key])), `${b.game}: missing ${manifest[key]}`);
    }
    const frame = details.find((d) => d.game === b.game).frame;
    assert.match(frame, /^\d+x\d+$/, `${b.game}: a hosted web build needs its Frame`);
  }
});

test("controls are Keys: action pairs", () => {
  for (const d of details) {
    for (const pair of d.controls.split(" · ")) assert.match(pair, /^.+: .+$/, `${d.game}: bad control "${pair}"`);
  }
});

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

const SCRAPE = `JSON.stringify({
      error: document.querySelector('.load-error')?.textContent || '',
      title: document.title,
      h1: document.querySelector('.cs-title')?.textContent.trim(),
      pills: Array.from(document.querySelectorAll('.g-pills .pill')).map(p => p.textContent.trim()),
      player: !!document.querySelector('.player'),
      playHref: document.querySelector('a.player-start')?.getAttribute('href') || '',
      playHere: !!document.querySelector('button.player-start'),
      status: document.querySelector('.player-status')?.textContent.trim() || '',
      featured: document.querySelector('.feature-name')?.textContent.trim() || '',
      featuredHref: document.querySelector('.feature .g-btn-primary')?.getAttribute('href') || '',
      cards: Array.from(document.querySelectorAll('.dl-name')).map(n => n.textContent.trim()),
      cardHrefs: Array.from(document.querySelectorAll('.dl-card .g-btn')).map(a => a.getAttribute('href')),
      controls: document.querySelectorAll('.ctrl').length,
      lead: document.querySelector('.g-lead')?.textContent.replace(/\\s+/g, ' ').trim(),
      more: Array.from(document.querySelectorAll('.g-card')).map(a => a.getAttribute('href')),
})`;

async function render(slug) {
  const { value, errors } = await evaluateOn(`games/${slug}/index.html`, SCRAPE);
  assert.deepEqual(errors, [], `games/${slug}/ threw`);
  return JSON.parse(value);
}

const expected = (slug) => {
  const row = rows[slugs.indexOf(slug)];
  const mine = builds.filter((b) => b.game === slug);
  return { row, mine, web: mine.find((b) => b.platform === "Web"), downloads: mine.filter((b) => b.platform !== "Web") };
};

browserTest("a web game with its build on the site plays here", async () => {
  const slug = "pong";
  const page = await render(slug);
  const { row, mine, web, downloads } = expected(slug);
  assert.equal(page.error, "");
  assert.equal(page.h1, plain(row.game));
  assert.ok(page.title.startsWith(row.game));
  assert.deepEqual(page.pills, [...new Set(mine.map((b) => b.platform))]);
  assert.ok(page.player);
  assert.ok(page.playHere, "the play button should start the build in place");
  assert.equal(page.playHref, "");
  assert.equal(page.status, "/" + web.source);
  assert.deepEqual(page.cards, downloads.map((b) => b.label || b.file));
  assert.deepEqual(page.cardHrefs, downloads.map((b) => b.source));
  assert.equal(page.controls, details.find((d) => d.game === slug).controls.split(" · ").length);
  assert.equal(page.lead, plain(descriptions.find((d) => d.title === slug).paragraphs[0]));
  assert.equal(page.more.length, 4);
  assert.equal(page.more[0], `../${slugs[(slugs.indexOf(slug) + 1) % slugs.length]}/`);
});

browserTest("a game without a web build features its first download", async () => {
  const slug = "gun-goal-tournament";
  const page = await render(slug);
  const { downloads } = expected(slug);
  assert.equal(page.error, "");
  assert.ok(!page.player);
  assert.equal(page.featured, downloads[0].label || downloads[0].file);
  assert.equal(page.featuredHref, downloads[0].source);
  assert.deepEqual(page.cards, downloads.slice(1).map((b) => b.label || b.file));
  assert.deepEqual(page.cardHrefs, downloads.slice(1).map((b) => b.source));
});
