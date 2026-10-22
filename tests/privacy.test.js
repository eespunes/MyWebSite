// Build v1.102 · 2026-10-14
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const slug of ['thrive', 'smart-bolus', 'beest']) {
  test(`${slug}: separate policy and hosted deletion routes`, () => {
    const policy = fs.readFileSync(path.join(root, 'privacy', slug, 'index.html'), 'utf8');
    const deletion = fs.readFileSync(path.join(root, 'deletion', slug, 'index.html'), 'utf8');
    assert.ok(!policy.includes('<form'));
    assert.ok(policy.includes(`/deletion/${slug}/`));
    assert.ok(deletion.includes(`/privacy/${slug}/`));
    assert.match(deletion, /method="post" action="https:\/\/formsubmit.co\/erik.espunyes7@gmail.com"/);
    assert.match(deletion, /name="email" type="email"[^>]*required/);
    assert.match(deletion, /name="app" value="[^"]+"/);
    assert.match(deletion, /name="_subject" value="[^"]+"/);
    assert.ok(!deletion.includes('disabled'));
    assert.match(deletion, /30 days of identity verification/);
    assert.match(deletion, /up to 90 days/);
    assert.doesNotMatch(policy + deletion, /pending developer review|still need.*confirmation|must be confirmed|Draft updated/);
    assert.ok(!deletion.includes('erik.espunyes7@outlook.com'));
    for (const html of [policy, deletion]) {
      for (const [, href] of html.matchAll(/href="(\/[^"#]*)/g)) {
        assert.ok(fs.existsSync(path.join(root, href)), `Missing local target ${href}`);
      }
    }
  });
}
test('Thrive retains the documented deletion periods', () => {
  const page = fs.readFileSync(path.join(root, 'deletion/thrive/index.html'), 'utf8');
  assert.match(page, /30 days of identity verification/);
  assert.match(page, /up to 90 days/);
});
