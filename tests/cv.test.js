// Build v1.88 · 2026-09-22
/* Renders cv.html (Spine v3) and asserts the printable CV carries exactly what
   CONTENT.md says — same values, same categories, nothing extra. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { sections, sub, plain, splitTags } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const SCRAPE = `JSON.stringify({
  title: document.title,
  pages: document.querySelectorAll('.cv-page').length,
  name: document.querySelector('.cv-name')?.innerText.replace(/\\s+/g, ' ').trim(),
  role: document.querySelector('.cv-role')?.textContent.trim(),
  lead: document.querySelector('.cv-lead')?.textContent.replace(/\\s+/g, ' ').trim(),
  contact: Array.from(document.querySelectorAll('.cv-contact-item')).map(item => ({
    label: item.querySelector('.cv-contact-label').textContent.trim(),
    value: item.querySelector('.cv-online')
      ? Array.from(item.querySelectorAll('.cv-online a')).map(a => a.textContent.trim())
      : item.querySelector('.cv-contact-value').textContent.trim() })),
  cards: Array.from(document.querySelectorAll('.cv-page--1 .cv-spine-content'))
    .filter(n => n.querySelector('h3'))
    .map(n => ({
      title: n.querySelector('h3').textContent.trim(),
      description: n.querySelector('p').textContent.replace(/\\s+/g, ' ').trim(),
      tags: Array.from(n.querySelectorAll('.cv-tag')).map(t => t.textContent.trim()) })),
  rows: Array.from(document.querySelectorAll('.cv-row')).map(r => ({
    label: r.querySelector('.cv-row-label').textContent.trim(),
    value: r.querySelector('.cv-row-value').textContent.replace(/\\s+/g, ' ').trim() })),
  education: Array.from(document.querySelectorAll('.cv-page--1 .cv-spine-content'))
    .filter(n => n.querySelector('.cv-item-title'))
    .map(n => ({
      when: n.querySelector('.cv-when')?.innerText.replace(/\\s+/g, ' ').trim() || '',
      expected: !!n.querySelector('.cv-badge'),
      title: n.querySelector('.cv-item-title').childNodes[0].textContent.trim(),
      sub: n.querySelector('.cv-item-sub')?.textContent.trim() || '' })),
  experience: Array.from(document.querySelectorAll('.cv-page--2 .cv-spine-content'))
    .filter(n => n.querySelector('h3'))
    .map(n => ({
      when: n.querySelector('.cv-when')?.innerText.replace(/\\s+/g, ' ').trim() || '',
      title: n.querySelector('h3').textContent.trim(),
      place: n.querySelector('.cv-item-sub')?.textContent.trim() || '',
      engagements: Array.from(n.querySelectorAll('.cv-eng')).map(e => ({
        head: e.querySelector('h4').textContent.trim(),
        meta: e.querySelector('.cv-eng-head span').textContent.trim(),
        bullets: e.querySelectorAll('li').length })),
      bullets: Array.from(n.querySelectorAll(':scope > ul > li')).map(li =>
        li.textContent.replace(/\\s+/g, ' ').trim()) })),
  projects: Array.from(document.querySelectorAll('.cv-page--2 .cv-spine-content'))
    .filter(n => n.querySelector('.cv-item-title'))
    .map(n => ({
      status: n.querySelector('.cv-status')?.textContent.trim() || '',
      title: n.querySelector('.cv-item-title').childNodes[0].textContent.trim(),
      stack: n.querySelector('.cv-stack')?.textContent.trim() || '',
      description: n.querySelector('p').textContent.replace(/\\s+/g, ' ').trim() })),
  allBullets: Array.from(document.querySelectorAll('.cv-page--2 li')).map(li =>
    li.textContent.replace(/\\s+/g, ' ').trim()),
  versions: Array.from(document.querySelectorAll('.cv-version')).map(v => v.textContent.trim()),
  pageNumbers: Array.from(document.querySelectorAll('.cv-foot')).map(f =>
    f.lastElementChild.textContent.trim()),
  bodyText: document.body.textContent.replace(/\\s+/g, ' '),
  overflowing: Array.from(document.querySelectorAll('.cv-page')).map(p =>
    p.scrollHeight > p.clientHeight),
  toolbar: [document.querySelector('.cv-back')?.textContent.trim(),
            document.querySelector('.cv-save')?.textContent.trim()],
})`;

let cv;
test.before(async () => {
  if (!chromeAvailable()) return;
  const { value, errors } = await evaluateOn("cv.html", SCRAPE);
  cv = JSON.parse(value);
  cv.jsErrors = errors;
});

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

const asDisplayed = (row) =>
  /^https?:/.test(row.link || "")
    ? row.link.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
    : plain(row.value);

browserTest("renders two pages without JavaScript errors", () => {
  assert.deepEqual(cv.jsErrors, []);
  assert.equal(cv.pages, 2);
});

browserTest("masthead carries the identity and the about lead", () => {
  assert.equal(cv.name, plain(sections.home.fields.name).replace(/\s*\/\s*/g, " "));
  assert.equal(cv.role, plain(sections.cv.fields.role));
  assert.ok(cv.title.startsWith(plain(sections.nav.fields.brand)));
  assert.equal(cv.lead, plain(sections.about.fields.lead));
});

browserTest("contact shows email, phone, location and online links — not the street address", () => {
  const byLabel = Object.fromEntries(cv.contact.map((c) => [c.label.toLowerCase(), c.value]));
  const rows = sections.contact.tables[0];
  const row = (k) => rows.find((r) => r.key.toLowerCase() === k);

  assert.equal(byLabel.email, plain(row("email").value));
  assert.equal(byLabel.phone, plain(row("phone").value));
  assert.equal(byLabel.location, plain(sections.contact.fields.location));

  const online = rows.filter((r) => /^https?:/.test(r.link || "")).map(asDisplayed);
  assert.deepEqual(byLabel[sections.cv.fields["online label"].toLowerCase()], online);

  const address = row("address");
  if (address) {
    const street = plain(address.value).split(",")[0];
    assert.ok(!cv.bodyText.includes(street), "the CV must not print the street address");
  }
});

browserTest("competency cards match the Competencies cards", () => {
  assert.deepEqual(
    cv.cards,
    sub(sections.competencies, "Cards").tables[0].map((r) => ({
      title: plain(r.title),
      description: plain(r.description),
      tags: splitTags(r.tags),
    }))
  );
});

browserTest("divider rows carry skill groups, languages and the additional line", () => {
  const expected = sub(sections.cv, "Skill groups").tables[0].map((r) => ({
    label: plain(r.group),
    value: plain(r.tags),
  }));
  expected.push({
    label: plain(sections.cv.fields["languages label"]),
    value: sub(sections.about, "Languages")
      .tables[0].map((r) => `${plain(r.language)} ${plain(r.level)}`)
      .join(" · "),
  });
  expected.push({
    label: plain(sections.cv.fields["also label"]),
    value: plain(sections.cv.fields.also),
  });
  assert.deepEqual(cv.rows, expected);
});

browserTest("education matches the About table, expected badge included", () => {
  const rendered = cv.education.map((e) => ({
    title: e.title,
    sub: e.sub,
    expected: e.expected,
  }));
  assert.deepEqual(
    rendered,
    sub(sections.about, "Education").tables[0].map((r) => ({
      title: plain(r.title),
      sub: plain(r.institution),
      expected: /\(expected\)/i.test(r.years),
    }))
  );
});

browserTest("experience entries mirror CONTENT.md with dates split from place", () => {
  const entries = sections.experience.subs.filter((s) => s.depth === 3);
  assert.equal(cv.experience.length, entries.length);
  entries.forEach((entry, i) => {
    const rendered = cv.experience[i];
    assert.equal(rendered.title, plain(entry.title));
    const metaParts = plain(entry.fields.meta).split("·").map((p) => p.trim());
    const dates = metaParts.find((p) => /\d{4}/.test(p));
    const place = metaParts.filter((p) => p !== dates).join(" · ");
    assert.equal(rendered.when.replace(/\s+/g, " "), dates.replace(/\s+/g, " "));
    assert.equal(rendered.place, place);
    assert.equal(rendered.engagements.length, entry.subs.length);
    entry.subs.forEach((engagement, j) => {
      assert.equal(
        rendered.engagements[j].head,
        `${plain(sections.cv.fields["engagement label"])} · ${plain(engagement.title)}`
      );
      assert.equal(rendered.engagements[j].bullets, engagement.bullets.length);
    });
  });
});

browserTest("every experience bullet reaches the CV", () => {
  const expected = [];
  for (const entry of sections.experience.subs.filter((s) => s.depth === 3)) {
    expected.push(...entry.bullets.map(plain));
    for (const engagement of entry.subs) expected.push(...engagement.bullets.map(plain));
  }
  assert.deepEqual(cv.allBullets.sort(), expected.sort());
});

browserTest("projects match the Projects table, status lowercased", () => {
  assert.deepEqual(
    cv.projects,
    sections.projects.tables[0].map((r) => ({
      status: plain(r.status).toLowerCase(),
      title: plain(r.project),
      stack: plain(r.stack),
      description: plain(r.description),
    }))
  );
});

browserTest("both CV pages carry the version", () => {
  assert.equal(cv.versions.length, 2, "expected a version stamp on each page");
  assert.equal(cv.versions[0], cv.versions[1]);
  assert.ok(cv.versions[0].startsWith(plain(sections.cv.fields["version label"])));
});

browserTest("page numbers are sequential and nothing overflows the paper", () => {
  assert.deepEqual(cv.pageNumbers, ["01 / 02", "02 / 02"]);
  assert.deepEqual(cv.overflowing, [false, false],
    "content runs past the A4 edge and would be clipped in the PDF");
});

browserTest("toolbar labels come from CONTENT.md", () => {
  assert.deepEqual(cv.toolbar, [
    plain(sections.cv.fields["back label"]),
    plain(sections.cv.fields["save label"]),
  ]);
});
