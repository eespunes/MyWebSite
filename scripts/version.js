#!/usr/bin/env node
/* Writes version.json from git history. Run by the pre-commit hook, so the
   number the site shows is the commit it was built from.

   The count includes the commit being written, which is why a pre-commit run
   adds one: at that point HEAD is still the previous commit. */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
/* --pending: a local pre-commit run, where the commit being written does not
   exist yet.
   --next:    a CI run that will itself commit version.json, so the count has
              to include that commit for the file to match the history it
              lands in. */
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
const date = git("log -1 --format=%cs", "");

const version = {
  version: `v1.${counted}`,
  commits: counted,
  /* The commit being written has no sha yet; record the one it follows. */
  sha: pending ? (inCi ? sha : "") : sha,
  date: pending ? new Date().toISOString().slice(0, 10) : date,
};

const file = path.join(ROOT, "version.json");
fs.writeFileSync(file, JSON.stringify(version, null, 2) + "\n");
console.log(`version.json → ${version.version}${version.sha ? " · " + version.sha : ""}`);
