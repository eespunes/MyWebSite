#!/usr/bin/env node
// Build v1.93 · 2026-09-22
/* Single source of the build number.

   Writes version.json and stamps the version into every source file, so the
   version is visible in the files themselves and not only at runtime:

     .html  <meta name="version" content="v1.34" />   (plus a comment)
     .js    // v1.34 · 2026-09-21
     .css   /* v1.34 · 2026-09-21 *\/
     .md    <!-- v1.34 · 2026-09-21 -->
     package.json  "version": "1.34"

   Flags:
     --pending  local pre-commit run; the commit being written has no sha yet
     --next     CI run that will itself commit the stamp, so count that commit
*/
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const pending = process.argv.includes("--pending") || process.argv.includes("--next");
const inCi = process.argv.includes("--next");

function git(command, fallback = "") {
  try {
    return execSync(`git ${command}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

const counted = Number(git("rev-list --count HEAD", "0")) + (pending ? 1 : 0);
const sha = git("rev-parse --short HEAD", "unknown");
const date = git("log -1 --format=%cs", "") || new Date().toISOString().slice(0, 10);

const info = {
  version: `v1.${counted}`,
  commits: counted,
  /* The commit being written has no sha yet; record the one it follows. */
  sha: pending ? (inCi ? sha : "") : sha,
  date: pending ? new Date().toISOString().slice(0, 10) : date,
};

const stamp = `${info.version} · ${info.date}`;

/* Files this project owns. Vendor and legacy template assets are left alone —
   stamping third-party or minified code would be churn, not information. */
const OWNED = [
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
];

const FILES = OWNED.filter(
  (rel) =>
    /\.(html|md|js|css)$/.test(rel) &&
    fs.existsSync(path.join(ROOT, rel)) &&
    fs.statSync(path.join(ROOT, rel)).isFile()
);

const MARK = "Build";

/* Each style is a [matcher, renderer] pair; matchers are anchored so a rerun
   replaces the previous stamp instead of stacking a new one. */
const STYLES = {
  ".js": {
    find: /^\/\/ Build v[\d.]+ · [\d-]+\n/m,
    line: () => `// ${MARK} ${stamp}\n`,
  },
  ".css": {
    find: /^\/\* Build v[\d.]+ · [\d-]+ \*\/\n/m,
    line: () => `/* ${MARK} ${stamp} */\n`,
  },
  ".md": {
    find: /^<!-- Build v[\d.]+ · [\d-]+ -->\n/m,
    line: () => `<!-- ${MARK} ${stamp} -->\n`,
  },
  ".html": {
    find: /^\s*<meta name="version" content="v[\d.]+" \/>\n/m,
    line: () => `    <meta name="version" content="${info.version}" />\n`,
  },
};

function stampFile(rel) {
  const file = path.join(ROOT, rel);
  const ext = path.extname(rel);
  const style = STYLES[ext];
  const before = fs.readFileSync(file, "utf8");
  let after;

  if (style.find.test(before)) {
    after = before.replace(style.find, style.line());
  } else if (before.startsWith("#!")) {
    /* A shebang has to stay on line one. */
    const cut = before.indexOf("\n") + 1;
    after = before.slice(0, cut) + style.line() + before.slice(cut);
  } else if (ext === ".html") {
    /* Sit with the other metadata rather than above the doctype. */
    after = before.replace(/^(\s*<meta charset[^\n]*\n)/m, `$1${style.line()}`);
  } else if (ext === ".md") {
    after = style.line() + before;
  } else {
    after = style.line() + before;
  }

  if (after === before) return false;
  fs.writeFileSync(file, after);
  return true;
}

fs.writeFileSync(path.join(ROOT, "version.json"), JSON.stringify(info, null, 2) + "\n");

const pkgFile = path.join(ROOT, "package.json");
if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  pkg.version = `1.${counted}.0`;
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
}

const changed = FILES.filter(stampFile);
console.log(`${info.version} → version.json, package.json, ${changed.length}/${FILES.length} files stamped`);
