// Build v1.38 · 2026-09-21
/* Loads CONTENT.md through the very parser the pages use. */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const CVParse = require(path.join(ROOT, "assets", "js", "parse.js"));

const markdown = fs.readFileSync(path.join(ROOT, "CONTENT.md"), "utf8");
const doc = CVParse.parse(markdown);
const sections = CVParse.index(doc);

const sub = (section, title) => CVParse.byTitle(section ? section.subs : [], title);

/* Rendered text loses markdown syntax, so compare on the same footing. */
const plain = (value) =>
  String(value === undefined ? "" : value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const splitTags = (value) =>
  String(value || "")
    .split("·")
    .map((t) => t.trim())
    .filter(Boolean);

module.exports = { ROOT, CVParse, markdown, doc, sections, sub, plain, splitTags };
