// Build v1.46 · 2026-09-21
/* Renders cv.html and asserts the printable CV carries the same data as the
   site, in the same categories — both being views of CONTENT.md. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { sections, sub, plain, splitTags } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const SCRAPE = `JSON.stringify({
  title: document.title,
  pages: document.querySelectorAll('.cv-page').length,
  name: document.querySelector('.cv-name')?.innerText.replace(/\\n/g, ' / ').trim(),
  role: document.querySelector('.cv-role')?.textContent.trim(),
  railLabels: Array.from(document.querySelectorAll('.cv-label')).map(l => l.textContent.trim()),
  contact: Array.from(document.querySelectorAll('.cv-contact div')).map(d => d.textContent.trim()),
  education: Array.from(document.querySelectorAll('.cv-list > div')).map(d => ({
    title: d.querySelector('.cv-item-title').textContent.trim(),
    institution: d.querySelector('.cv-item-sub').textContent.trim(),
    years: d.querySelector('.cv-item-when').textContent.trim() })),
  languages: Array.from(document.querySelectorAll('.cv-lang')).map(l => ({
    language: l.children[0].textContent.trim(),
    level: l.children[1].textContent.trim() })),
  certifications: Array.from(document.querySelectorAll('.cv-certs div')).map(d => d.textContent.replace(/\\s+/g,' ').trim()),
  also: document.querySelector('.cv-also')?.textContent.replace(/\\s+/g,' ').trim(),
  headings: Array.from(document.querySelectorAll('.cv-heading span:last-child')).map(s => s.textContent.trim()),
  aboutParas: Array.from(document.querySelectorAll('.cv-section .cv-body')).map(p => p.textContent.replace(/\\s+/g,' ').trim()),
  stats: Array.from(document.querySelectorAll('.cv-stat')).map(s => ({
    figure: s.querySelector('.cv-stat-num').textContent.trim(),
    label: s.querySelector('.cv-stat-label').textContent.replace(/\\s+/g,' ').trim() })),
  skillGroups: Array.from(document.querySelectorAll('.cv-group')).map(g => ({
    group: g.querySelector('.cv-group-label').textContent.trim(),
    tags: Array.from(g.querySelectorAll('.cv-tag')).map(t => t.textContent.trim()) })),
  quote: document.querySelector('.cv-quote p')?.textContent.replace(/\\s+/g,' ').trim(),
  footer: Array.from(document.querySelectorAll('.cv-footer span')).map(s => s.textContent.trim()),
  kicker: document.querySelector('.cv-kicker')?.textContent.trim(),
  entries: Array.from(document.querySelectorAll('.cv-entry')).map(e => ({
    when: e.querySelector('.cv-entry-when').innerText.replace(/\\n/g, ' ').replace(/\\s+/g,' ').trim(),
    heads: Array.from(e.querySelectorAll('h3')).map(h => h.textContent.trim()),
    meta: e.querySelector('.cv-entry-meta')?.textContent.replace(/\\s+/g,' ').trim() || '',
    bullets: Array.from(e.querySelectorAll('li')).map(li => li.textContent.replace(/\\s+/g,' ').trim()),
    paras: Array.from(e.querySelectorAll('p')).map(p => p.textContent.replace(/\\s+/g,' ').trim()) })),
  versions: Array.from(document.querySelectorAll('.cv-version')).map(v => v.textContent.trim()),
  projects: Array.from(document.querySelectorAll('.cv-projects .cv-project-head')).map(h => ({
    title: h.querySelector('h3').textContent.trim(),
    status: h.querySelector('.cv-project-status')?.textContent.trim() || '',
    description: h.parentElement.querySelector('p').textContent.replace(/\\s+/g,' ').trim(),
    stack: h.parentElement.querySelector('.cv-project-stack')?.textContent.trim() || '' })),
  pageNumbers: [
    document.querySelector('.cv-pageno')?.textContent.trim(),
    document.querySelector('.cv-page-foot span:last-child')?.textContent.trim() ],
  overflowing: Array.from(document.querySelectorAll('.cv-page')).map(p => p.scrollHeight > p.clientHeight),
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

browserTest("renders two pages without JavaScript errors", () => {
  assert.deepEqual(cv.jsErrors, []);
  assert.equal(cv.pages, 2);
});

browserTest("identity comes from Nav, Home and CV", () => {
  assert.equal(cv.name, plain(sections.home.fields.name));
  assert.equal(cv.role, plain(sections.cv.fields.role));
  assert.ok(cv.title.startsWith(plain(sections.nav.fields.brand)));
});

browserTest("contact repeats the site's rows, address included", () => {
  const expected = sections.contact.tables[0].map((r) =>
    /^https?:/.test(r.link)
      ? r.link.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
      : plain(r.value)
  );
  assert.deepEqual(cv.contact, expected);

  const address = sections.contact.tables[0].find((r) => r.key.toLowerCase() === "address");
  if (address) {
    assert.ok(
      cv.contact.includes(plain(address.value)),
      "the CV should print the address the site shows"
    );
  }
});

browserTest("education and languages match the About tables", () => {
  assert.deepEqual(
    cv.education,
    sub(sections.about, "Education").tables[0].map((r) => ({
      title: plain(r.title),
      institution: plain(r.institution),
      /* the uppercase look is CSS text-transform; the text itself is as written */
      years: plain(r.years),
    }))
  );
  assert.deepEqual(
    cv.languages,
    sub(sections.about, "Languages").tables[0].map((r) => ({
      language: plain(r.language),
      level: plain(r.level),
    }))
  );
});

browserTest("highlights match the same Numbers table the site uses", () => {
  assert.deepEqual(
    cv.stats,
    sub(sections.about, "Numbers").tables[0].map((r) => ({
      figure: plain(r.figure),
      label: plain(r.label),
    }))
  );
});

browserTest("about copy matches the About section", () => {
  const expected = [plain(sections.about.fields.lead), plain(sections.about.fields.body)];
  assert.deepEqual(cv.aboutParas.slice(0, 2), expected);
});

browserTest("certifications render when declared, and not when they are not", () => {
  const table = sub(sections.cv, "Certifications");
  if (!table || !table.tables[0] || !table.tables[0].length) {
    assert.deepEqual(cv.certifications, [], "no Certifications table, so nothing should render");
    return;
  }
  assert.deepEqual(
    cv.certifications,
    table.tables[0].map((r) =>
      r.note ? `${plain(r.title)} (${plain(r.note)})` : plain(r.title)
    )
  );
});

browserTest("skill groups match the CV section", () => {
  assert.deepEqual(
    cv.skillGroups,
    sub(sections.cv, "Skill groups").tables[0].map((r) => ({
      group: plain(r.group),
      tags: splitTags(r.tags),
    }))
  );
});

browserTest("nothing renders for sections CONTENT.md no longer declares", () => {
  assert.ok(!sub(sections.cv, "Prior roles"), "Prior roles is gone from CONTENT.md");
  const labels = cv.entries.map((e) => e.when);
  assert.ok(
    !labels.some((l) => /PRIOR/i.test(l)),
    "the CV still renders a Prior Roles block"
  );
});

browserTest("every experience bullet reaches the CV", () => {
  const expected = [];
  for (const entry of sections.experience.subs.filter((s) => s.depth === 3)) {
    expected.push(...entry.bullets.map(plain));
    for (const engagement of entry.subs) expected.push(...engagement.bullets.map(plain));
  }
  const rendered = cv.entries.flatMap((e) => e.bullets);
  assert.deepEqual(rendered.sort(), expected.sort());
});

browserTest("labels, quote and footer come from CONTENT.md", () => {
  assert.deepEqual(cv.headings, [
    plain(sections.cv.fields["about label"]),
    plain(sections.cv.fields["highlights label"]),
    plain(sections.cv.fields["competencies label"]),
    plain(sections.cv.fields["experience label"]),
    plain(sections.cv.fields["projects label"]),
  ]);
  assert.equal(cv.kicker, plain(sections.cv.fields.kicker));
  assert.equal(cv.quote, plain(sections.cv.fields.quote));
  assert.equal(cv.also, plain(sections.cv.fields.also));
  assert.deepEqual(cv.toolbar, [
    plain(sections.cv.fields["back label"]),
    plain(sections.cv.fields["save label"]),
  ]);
  assert.equal(cv.footer.at(-1), plain(sections.cv.fields["footer right"]));
  const expectedRail = [plain(sections.cv.fields["contact label"]), "Education", "Languages"];
  const certs = sub(sections.cv, "Certifications");
  if (certs && certs.tables[0] && certs.tables[0].length) expectedRail.push("Certifications");
  if (sections.cv.fields.also) expectedRail.push(plain(sections.cv.fields["also label"]));
  assert.deepEqual(cv.railLabels, expectedRail);
});

browserTest("both CV pages carry the version", () => {
  assert.equal(cv.versions.length, 2, "expected a version stamp on each page");
  assert.equal(cv.versions[0], cv.versions[1]);
  assert.ok(cv.versions[0].startsWith(plain(sections.cv.fields["version label"])));
});

browserTest("personal projects carry the same data as the site's Projects", () => {
  assert.deepEqual(
    cv.projects,
    sections.projects.tables[0].map((r) => ({
      title: plain(r.project),
      status: plain(r.status),
      description: plain(r.description),
      stack: plain(r.stack),
    }))
  );
});

browserTest("page numbers are sequential and nothing overflows the paper", () => {
  assert.deepEqual(cv.pageNumbers, ["01 / 02", "02 / 02"]);
  assert.deepEqual(
    cv.overflowing,
    [false, false],
    "content runs past the A4 edge and would be clipped in the PDF"
  );
});
