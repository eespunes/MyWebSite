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

`version.json` carries `v1.<commit-count>`, shown in both footers as
`Build v1.<n>`. The GitHub Action in `.github/workflows/version.yml` rewrites it
after anything lands on `master`, counting its own stamping commit so the file
matches the history it ships in. Pushes that only touch `version.json` are
ignored, so the bot cannot retrigger itself.

Nothing needs installing locally. To refresh it by hand:

    npm run version:write

A pre-commit hook is available (`npm run hooks:install`) for anyone who wants
the number to move without pushing — but with CI stamping too, each push would
then bump it twice, so leave it off unless you have a reason. Without
`version.json` the stamp simply does not render.
