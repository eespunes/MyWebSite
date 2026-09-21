# Tests

    npm test

Three layers, all asserting the same thing from different angles: **the page
shows exactly what `CONTENT.md` says, and the site and the CV agree.**

| File | Needs a browser | What it guards |
| --- | --- | --- |
| `content.test.js` | no | `CONTENT.md`'s shape — required sections, fields and table columns, well-formed links, images that exist on disk |
| `site.test.js` | yes | every category on `index.html` against the Markdown, value by value |
| `cv.test.js` | yes | every category on `cv.html`, plus page numbering, A4 overflow and that the street address stays off the CV |
| `parity.test.js` | yes | the two rendered surfaces against **each other** |
| `version.test.js` | partly | `version.json` tracks the commit count, and both footers show the same build stamp |

Browser tests render the real pages in headless Chrome over a temporary local
server, so they exercise the same `parse.js` → renderer path a visitor does.
They skip (rather than fail) when Chrome is missing; point `CHROME_PATH` at it
if yours lives somewhere unusual.

Editing content never breaks these — both views read the same file, so a change
flows to both. They fail when the *link* breaks: a renderer that drops or
hard-codes a value, a field the renderers need going missing, or the CV and the
site disagreeing.

## Version stamp

`version.json` is generated from git by `scripts/version.js` and shown in both
footers as `Build v1.<commits> · <sha>`. A pre-commit hook keeps it current:

    npm run hooks:install     # once per checkout
    npm run version:write     # or refresh it by hand

The hook is local to your clone (git does not ship hooks), so install it after
cloning. Without `version.json` the stamp simply does not render.
