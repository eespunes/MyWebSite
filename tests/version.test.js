/* The build stamp: derived from git, identical on both surfaces. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { ROOT, sections } = require("./helpers/content.js");
const { evaluateOn, chromeAvailable, CHROME } = require("./helpers/render.js");

const versionFile = path.join(ROOT, "version.json");

test("version.json exists and is well formed", () => {
  assert.ok(fs.existsSync(versionFile), "version.json is missing — run npm run version:write");
  const info = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  assert.match(info.version, /^v\d+\.\d+$/);
  assert.equal(typeof info.commits, "number");
  assert.equal(typeof info.sha, "string");
  assert.ok(info.commits > 0);
  assert.match(info.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("the version tracks the commit count", () => {
  const info = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  const head = Number(
    execSync("git rev-list --count HEAD", { cwd: ROOT }).toString().trim()
  );
  /* Written pre-commit, so it is the commit being made: head, or head + 1
     while that commit is still pending. */
  assert.ok(
    info.commits === head || info.commits === head + 1,
    `version.json says ${info.commits} commits, git says ${head}`
  );
  assert.equal(info.version, `v1.${info.commits}`);
});

test("both footers declare a version label", () => {
  assert.ok(sections.contact.fields["version label"], "Contact has no Version label");
  assert.ok(sections.cv.fields["version label"], "CV has no Version label");
});

const browserTest = (name, fn) =>
  test(name, { skip: chromeAvailable() ? false : `Chrome not found at ${CHROME}` }, fn);

browserTest("the site and the CV show the same version", async () => {
  const info = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  const expected = `${sections.contact.fields["version label"]} ${info.version}`;

  const site = await evaluateOn(
    "index.html",
    `new Promise(done => {
       const poll = setInterval(() => {
         const el = document.querySelector('.footer-version');
         if (el && el.textContent.trim()) { clearInterval(poll); done(el.textContent.trim()); }
       }, 50);
       setTimeout(() => { clearInterval(poll); done(''); }, 5000);
     })`
  );
  const cv = await evaluateOn(
    "cv.html",
    `new Promise(done => {
       const poll = setInterval(() => {
         const el = document.querySelector('.cv-version');
         if (el && el.textContent.trim()) { clearInterval(poll); done(el.textContent.trim()); }
       }, 50);
       setTimeout(() => { clearInterval(poll); done(''); }, 5000);
     })`
  );

  assert.equal(site.value, expected, "site footer version");
  assert.equal(cv.value, expected, "CV footer version");
  assert.equal(site.value, cv.value, "the two surfaces disagree on the version");
});
