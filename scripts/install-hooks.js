#!/usr/bin/env node
// Build v1.53 · 2026-09-21
/* Installs a pre-commit hook that refreshes version.json and stages it, so the
   version bumps with every commit without anyone remembering to do it. */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const hooks = path.join(ROOT, ".git", "hooks");
if (!fs.existsSync(hooks)) {
  console.error("No .git/hooks directory — is this a git checkout?");
  process.exit(1);
}

const hook = `#!/bin/sh
# Managed by scripts/install-hooks.js — refresh the displayed version.
node scripts/version.js --pending || exit 0
git add version.json
`;

const file = path.join(hooks, "pre-commit");
fs.writeFileSync(file, hook, { mode: 0o755 });
console.log("Installed .git/hooks/pre-commit");
