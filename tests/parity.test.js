// Build v1.89 · 2026-09-22
/* The site and the CV are two views of one file. These compare them against
   each other, so a category that drifts on one surface fails here even if
   both still parse. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { plain } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const SITE = `JSON.stringify({
  education: Array.from(document.querySelectorAll('.edu-row')).map(r => [
    r.querySelector('.edu-title').textContent.trim(),
    r.querySelector('.edu-sub').textContent.trim(),
    r.querySelector('.edu-when').textContent.trim() ]),
  languages: Array.from(document.querySelectorAll('.lang')).map(l => [
    l.childNodes[0].textContent.trim(), l.querySelector('span').textContent.trim() ]),
  numbers: Array.from(document.querySelectorAll('.stat')).map(s => [
    s.querySelector('.stat-num').textContent.trim(),
    s.querySelector('.stat-label').textContent.replace(/\\s+/g,' ').trim() ]),
  bullets: Array.from(document.querySelectorAll('.tl-body li')).map(li => li.textContent.replace(/\\s+/g,' ').trim()),
  contactValues: Array.from(document.querySelectorAll('.contact-val')).map(v => v.textContent.trim()),
  contactKeys: Array.from(document.querySelectorAll('.contact-key')).map(v => v.textContent.trim()),
  aboutLead: document.querySelector('.about-lead').textContent.replace(/\\s+/g,' ').trim(),
  projects: Array.from(document.querySelectorAll('.project')).map(p => ({
    title: p.querySelector('h3').textContent.trim(),
    description: p.querySelector('p').textContent.replace(/\\s+/g,' ').trim() })),
})`;

const CV = `JSON.stringify({
  education: Array.from(document.querySelectorAll('.cv-page--1 .cv-spine-content'))
    .filter(n => n.querySelector('.cv-item-title'))
    .map(n => [
      n.querySelector('.cv-item-title').childNodes[0].textContent.trim(),
      n.querySelector('.cv-item-sub')?.textContent.trim() || '' ]),
  languagesText: Array.from(document.querySelectorAll('.cv-row'))
    .map(r => r.textContent.replace(/\\s+/g, ' ').trim()).join(' | '),
  bullets: Array.from(document.querySelectorAll('.cv-page--2 li')).map(li => li.textContent.replace(/\\s+/g,' ').trim()),
  contactLines: Array.from(document.querySelectorAll('.cv-contact-item .cv-contact-value, .cv-online a'))
    .map(d => d.textContent.trim()).filter(t => t),
  aboutLead: document.querySelector('.cv-lead').textContent.replace(/\\s+/g,' ').trim(),
  projects: Array.from(document.querySelectorAll('.cv-page--2 .cv-spine-content'))
    .filter(n => n.querySelector('.cv-item-title'))
    .map(n => ({
      title: n.querySelector('.cv-item-title').childNodes[0].textContent.trim(),
      description: n.querySelector('p').textContent.replace(/\\s+/g,' ').trim() })),
  bodyText: document.body.textContent.replace(/\\s+/g, ' '),
})`;

let site, cv;
test.before(async () => {
  if (!chromeAvailable()) return;
  site = JSON.parse((await evaluateOn("index.html", SITE)).value);
  cv = JSON.parse((await evaluateOn("cv.html", CV)).value);
});

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

browserTest("education is identical on both surfaces", () => {
  assert.deepEqual(cv.education, site.education.map((row) => [row[0], row[1]]));
});

browserTest("every spoken language and level appears on the CV", () => {
  for (const [language, level] of site.languages) {
    assert.ok(
      cv.languagesText.includes(`${language} ${level}`),
      `${language} ${level} missing from the CV rows`
    );
  }
});

browserTest("the about lead is identical on both surfaces", () => {
  assert.equal(cv.aboutLead, site.aboutLead);
});

browserTest("no experience bullet appears on one surface only", () => {
  const onlyOnSite = site.bullets.filter((b) => !cv.bullets.includes(b));
  const onlyOnCv = cv.bullets.filter((b) => !site.bullets.includes(b));
  assert.deepEqual(onlyOnSite, [], "bullets on the site but missing from the CV");
  assert.deepEqual(onlyOnCv, [], "bullets in the CV but missing from the site");
});

browserTest("personal project copy is identical on both surfaces", () => {
  assert.deepEqual(
    cv.projects,
    site.projects.map((p) => ({ title: p.title, description: p.description }))
  );
});

browserTest("shared contact values appear on both surfaces", () => {
  const { sections } = require("./helpers/content.js");
  const cvOnly = sections.contact.tables[0]
    .filter((r) => (r["cv only"] || "").toLowerCase() === "yes")
    .map((r) => plain(r.value).toLowerCase());

  const siteText = site.contactValues.join(" ").toLowerCase();
  for (const line of cv.contactLines) {
    const handle = line.split("/").pop().toLowerCase();
    if (cvOnly.some((v) => line.toLowerCase().includes(v) || v.includes(handle))) {
      assert.ok(
        !siteText.includes(line.toLowerCase()),
        `CV-only contact "${line}" should not be on the site`
      );
      continue;
    }
    assert.ok(
      siteText.includes(line.toLowerCase()) || siteText.includes(handle),
      `CV contact "${line}" does not appear on the site`
    );
  }
});

browserTest("the street address stays off the CV, the city stays on it", () => {
  const index = site.contactKeys.findIndex((k) => k.toLowerCase() === "address");
  if (index === -1) return;
  const street = site.contactValues[index].split(",")[0];
  assert.ok(street, "site shows an address");
  assert.ok(!cv.bodyText.includes(street), "the CV must not print the street address");
  const { sections } = require("./helpers/content.js");
  assert.ok(
    cv.bodyText.includes(plain(sections.contact.fields.location)),
    "the CV should show the city-level location"
  );
});
