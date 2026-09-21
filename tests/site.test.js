// Build v1.43 · 2026-09-21
/* Renders index.html in a real browser and asserts the page shows exactly what
   CONTENT.md says — same values, in the same categories, nothing extra. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { sections, sub, plain, splitTags } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const SCRAPE = `JSON.stringify({
  title: document.title,
  nav: Array.from(document.querySelectorAll('.nav-links a')).map(a => a.textContent.trim()),
  sectionIds: Array.from(document.querySelectorAll('section[data-snap]')).map(s => s.id),
  dots: Array.from(document.querySelectorAll('.dot')).map(d => d.getAttribute('data-dot')),
  eyebrow: document.querySelector('.eyebrow-text')?.textContent.trim(),
  heroName: document.querySelector('.hero-title')?.innerText.replace(/\\n/g, ' / ').trim(),
  heroLead: document.querySelector('.hero-lead')?.textContent.trim(),
  buttons: Array.from(document.querySelectorAll('.btn-row a')).map(a => a.textContent.trim()),
  aboutLead: document.querySelector('.about-lead')?.textContent.replace(/\\s+/g,' ').trim(),
  aboutBody: document.querySelector('#s-about .body-dark')?.textContent.replace(/\\s+/g,' ').trim(),
  stats: Array.from(document.querySelectorAll('.stat')).map(s => ({
    figure: s.querySelector('.stat-num').textContent.trim(),
    label: s.querySelector('.stat-label').textContent.replace(/\\s+/g,' ').trim() })),
  education: Array.from(document.querySelectorAll('.edu-row')).map(r => ({
    years: r.querySelector('.edu-when').textContent.trim(),
    title: r.querySelector('.edu-title').textContent.trim(),
    institution: r.querySelector('.edu-sub').textContent.trim() })),
  languages: Array.from(document.querySelectorAll('.lang')).map(l => l.textContent.replace(/\\s+/g,' ').trim()),
  colLabels: Array.from(document.querySelectorAll('#s-about .col-label')).map(l => l.textContent.trim()),
  experience: Array.from(document.querySelectorAll('.tl-item')).map(item => ({
    when: item.querySelector('.tl-when').innerText.replace(/\\n/g, ' / ').trim(),
    title: item.querySelector('h3').textContent.trim(),
    meta: item.querySelector('.tl-meta').textContent.trim(),
    bullets: Array.from(item.querySelectorAll(':scope > .tl-body > ul > li, :scope > .tl-body > .exp-body > ul > li'))
      .map(li => li.textContent.replace(/\\s+/g,' ').trim()),
    engagements: Array.from(item.querySelectorAll('.engagement')).map(e => ({
      title: e.querySelector('h4').textContent.trim(),
      meta: e.querySelector('.engagement-head span').textContent.trim(),
      bullets: Array.from(e.querySelectorAll('li')).map(li => li.textContent.replace(/\\s+/g,' ').trim()) })) })),
  skills: Array.from(document.querySelectorAll('.skill-card')).map(c => ({
    num: c.querySelector('.skill-num').textContent.trim(),
    title: c.querySelector('h3').textContent.trim(),
    description: c.querySelector('p').textContent.replace(/\\s+/g,' ').trim(),
    tags: Array.from(c.querySelectorAll('.tag')).map(t => t.textContent.trim()) })),
  tagRows: Array.from(document.querySelectorAll('.tag-row')).map(r => ({
    label: r.querySelector('.tag-row-label').textContent.trim(),
    tags: Array.from(r.querySelectorAll('.tag')).map(t => t.textContent.trim()) })),
  projects: Array.from(document.querySelectorAll('.project')).map(p => ({
    num: p.querySelector('.project-num').textContent.trim(),
    title: p.querySelector('h3').textContent.trim(),
    status: p.querySelector('.project-status')?.textContent.trim() || '',
    description: p.querySelector('p').textContent.replace(/\\s+/g,' ').trim(),
    stack: p.querySelector('.project-stack')?.textContent.trim() || '',
    link: p.querySelector('a')?.getAttribute('href') || '' })),
  games: Array.from(document.querySelectorAll('.game-card')).map(c => ({
    num: c.querySelector('.game-num').textContent.trim(),
    name: c.querySelector('.game-name').textContent.trim(),
    subtitle: c.querySelector('.game-sub').textContent.trim(),
    tech: c.querySelector('.game-tech').textContent.trim(),
    year: c.querySelector('.game-year')?.textContent.trim() || '',
    image: c.querySelector('img').getAttribute('src'),
    link: c.getAttribute('href'),
    featured: !!c.querySelector('.game-badge') })),
  railHint: document.querySelector('.rail-hint')?.textContent.trim(),
  contact: Array.from(document.querySelectorAll('.contact-list > *')).map(row => ({
    key: row.querySelector('.contact-key').textContent.trim(),
    value: row.querySelector('.contact-val').textContent.trim(),
    link: row.getAttribute('href') || '' })),
  footer: Array.from(document.querySelectorAll('.footer span')).map(s => s.textContent.trim()),
})`;

let page;
test.before(async () => {
  if (!chromeAvailable()) return;
  const { value, errors } = await evaluateOn("index.html", SCRAPE);
  page = JSON.parse(value);
  page.jsErrors = errors;
});

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

browserTest("renders without JavaScript errors", () => {
  assert.deepEqual(page.jsErrors, []);
});

browserTest("page metadata matches Meta", () => {
  assert.equal(page.title, sections.meta.fields.title);
});

browserTest("nav and dots cover exactly the sections that declare a nav label", () => {
  const labelled = sections.nav ? [] : [];
  const expected = [];
  for (const section of Object.values(sections)) {
    if (section.fields["nav label"]) expected.push(section.fields["nav label"]);
  }
  assert.deepEqual(page.nav, expected);
  assert.equal(page.dots.length, expected.length + 1, "one dot per nav entry plus home");
  assert.deepEqual(page.sectionIds.length, page.dots.length);
});

browserTest("home matches Home", () => {
  const home = sections.home.fields;
  assert.equal(page.eyebrow, plain(home.eyebrow));
  assert.equal(page.heroName, plain(home.name));
  assert.equal(page.heroLead, plain(home.lead));
  assert.deepEqual(page.buttons, [
    plain(home["primary button"].split("→")[0]),
    plain(home["secondary button"].split("→")[0]),
  ]);
});

browserTest("about text, numbers, education and languages match About", () => {
  assert.equal(page.aboutLead, plain(sections.about.fields.lead));
  assert.equal(page.aboutBody, plain(sections.about.fields.body));

  assert.deepEqual(
    page.stats,
    sub(sections.about, "Numbers").tables[0].map((r) => ({
      figure: plain(r.figure),
      label: plain(r.label),
    }))
  );
  assert.deepEqual(
    page.education,
    sub(sections.about, "Education").tables[0].map((r) => ({
      years: plain(r.years),
      title: plain(r.title),
      institution: plain(r.institution),
    }))
  );
  assert.deepEqual(
    page.languages,
    sub(sections.about, "Languages").tables[0].map((r) => `${plain(r.language)} ${plain(r.level)}`)
  );
  assert.deepEqual(page.colLabels, ["Education", "Languages"]);
});

browserTest("experience entries, engagements and bullets match Experience", () => {
  const entries = sections.experience.subs.filter((s) => s.depth === 3);
  assert.equal(page.experience.length, entries.length);

  entries.forEach((entry, i) => {
    const rendered = page.experience[i];
    assert.equal(rendered.title, plain(entry.title));
    assert.equal(rendered.meta, plain(entry.fields.meta));
    assert.equal(rendered.when, plain(entry.fields.period));
    assert.deepEqual(rendered.bullets, entry.bullets.map(plain));
    assert.deepEqual(
      rendered.engagements,
      entry.subs.map((e) => ({
        title: plain(e.title),
        meta: plain(e.fields.meta),
        bullets: e.bullets.map(plain),
      }))
    );
  });
});

browserTest("competency cards and tag rows match Competencies", () => {
  assert.deepEqual(
    page.skills,
    sub(sections.competencies, "Cards").tables[0].map((r) => ({
      num: plain(r["#"]),
      title: plain(r.title),
      description: plain(r.description),
      tags: splitTags(r.tags),
    }))
  );
  assert.deepEqual(
    page.tagRows,
    sub(sections.competencies, "Tag rows").tables[0].map((r) => ({
      label: plain(r.label),
      tags: splitTags(r.tags),
    }))
  );
});

browserTest("project cards match Projects", () => {
  assert.deepEqual(
    page.projects,
    sections.projects.tables[0].map((r) => ({
      num: plain(r["#"]),
      title: plain(r.project),
      status: plain(r.status),
      description: plain(r.description),
      stack: plain(r.stack),
      link: r.link || "",
    }))
  );
});

browserTest("game cards match Games, in order", () => {
  assert.deepEqual(
    page.games,
    sections.games.tables[0].map((r) => ({
      num: plain(r["#"]),
      name: plain(r.game),
      subtitle: plain(r.subtitle),
      tech: plain(r.tech),
      year: plain(r.year),
      image: "assets/images/" + r.image,
      link: r.link,
      featured: (r.featured || "").toLowerCase() === "yes",
    }))
  );
  assert.equal(
    page.railHint,
    plain(sections.games.fields.hint.replace("{count}", sections.games.tables[0].length))
  );
});

browserTest("contact rows and footer match Contact", () => {
  assert.deepEqual(
    page.contact,
    sections.contact.tables[0].map((r) => ({
      key: plain(r.key),
      value: plain(r.value),
      link: r.link || "",
    }))
  );
  /* The middle span is the build stamp, covered by version.test.js. */
  assert.equal(page.footer.at(0), plain(sections.contact.fields["footer left"]));
  assert.equal(page.footer.at(-1), plain(sections.contact.fields["footer right"]));
});
