// Build v1.97 · 2026-09-22
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


test("every owned source file carries the current version stamp", () => {
  const info = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  /* The same list scripts/version.js stamps: vendor and legacy template
     assets are deliberately excluded. */
  const owned = [
    "index.html",
    "cv.html",
    "CONTENT.md",
    "assets/js/parse.js",
    "assets/js/content.js",
    "assets/js/cv.js",
    "assets/js/site.js",
    "assets/css/site.css",
    "assets/css/cv.css",
    ...fs.readdirSync(path.join(ROOT, "scripts")).map((f) => `scripts/${f}`),
    ...fs.readdirSync(path.join(ROOT, "tests")).map((f) => `tests/${f}`),
    ...fs.readdirSync(path.join(ROOT, "tests", "helpers")).map((f) => `tests/helpers/${f}`),
  ].filter(
    (rel) =>
      /\.(html|md|js|css)$/.test(rel) &&
      fs.existsSync(path.join(ROOT, rel)) &&
      fs.statSync(path.join(ROOT, rel)).isFile()
  );
  assert.ok(owned.length > 10, "expected to find the owned source files");

  const unstamped = owned.filter((rel) => {
    const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
    return rel.endsWith(".html")
      ? !text.includes(`<meta name="version" content="${info.version}" />`)
      : !text.includes(`Build ${info.version} ·`);
  });
  assert.deepEqual(unstamped, [], "these files are missing the current stamp");
});

test("vendor and legacy assets are left untouched", () => {
  const vendor = ["assets/css/vendor.css", "assets/js/vendor.js", "assets/css/erik.css"];
  for (const rel of vendor) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    assert.ok(!text.startsWith("// Build"), `${rel} should not be stamped`);
    assert.ok(!text.startsWith("/* Build"), `${rel} should not be stamped`);
  }
});

test("package.json carries the same number", () => {
  const info = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.version, `1.${info.commits}.0`);
});

test("the stamp never displaces a shebang", () => {
  for (const name of fs.readdirSync(path.join(ROOT, "scripts"))) {
    if (!name.endsWith(".js")) continue;
    const text = fs.readFileSync(path.join(ROOT, "scripts", name), "utf8");
    if (!text.includes("#!")) continue;
    assert.ok(text.startsWith("#!"), `${name}: shebang must stay on line one`);
  }
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
