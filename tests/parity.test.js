// Build v1.82 · 2026-09-21
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
})`;

const CV = `JSON.stringify({
  education: Array.from(document.querySelectorAll('.cv-list > div')).map(d => [
    d.querySelector('.cv-item-title').textContent.trim(),
    d.querySelector('.cv-item-sub').textContent.trim(),
    d.querySelector('.cv-item-when').textContent.trim() ]),
  languages: Array.from(document.querySelectorAll('.cv-lang')).map(l => [
    l.children[0].textContent.trim(), l.children[1].textContent.trim() ]),
  numbers: Array.from(document.querySelectorAll('.cv-stat')).map(s => [
    s.querySelector('.cv-stat-num').textContent.trim(),
    s.querySelector('.cv-stat-label').textContent.replace(/\\s+/g,' ').trim() ]),
  bullets: Array.from(document.querySelectorAll('.cv-entry-body li')).map(li => li.textContent.replace(/\\s+/g,' ').trim()),
  contactLines: Array.from(document.querySelectorAll('.cv-contact > *')).map(d => d.textContent.trim()),
  aboutLead: document.querySelectorAll('.cv-section .cv-body')[0].textContent.replace(/\\s+/g,' ').trim(),
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
  assert.deepEqual(cv.education, site.education);
});

browserTest("languages are identical on both surfaces", () => {
  assert.deepEqual(cv.languages, site.languages);
});

browserTest("the highlight figures are identical on both surfaces", () => {
  assert.deepEqual(cv.numbers, site.numbers);
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

browserTest("personal projects are identical on both surfaces", () => {
  assert.deepEqual(cv.projects, site.projects);
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

browserTest("the address appears on both surfaces", () => {
  const index = site.contactKeys.findIndex((k) => k.toLowerCase() === "address");
  if (index === -1) return;
  const address = site.contactValues[index];
  assert.ok(address, "site shows an address");
  assert.ok(
    cv.contactLines.some((line) => line === address),
    "the CV should show the same address as the site"
  );
});
