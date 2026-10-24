import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateDecisionRecords } from './validate-decision-records.mjs';

const RECORD = (n, extra = {}) => {
  const fm = {
    status: 'accepted',
    date: '2026-10-24',
    list_decision_makers: ['maintainers'],
    list_repos: ['rockcarver/frodo-cli'],
    ...extra,
  };
  const lines = ['---', `status: ${fm.status}`, `date: ${fm.date}`, 'decision-makers:', ...fm.list_decision_makers.map((x) => `  - ${x}`), 'repos:', ...fm.list_repos.map((x) => `  - ${x}`), '---', '', `# Record ${n}`, '', '## Context and problem statement', '', 'Why.', '', '## Decision', '', 'What.', '', '## Consequences', '', 'So what.', ''];
  return lines.join('\n');
};
const README = (rows) => ['# Decisions', '', '| # | Title | Status |', '| - | - | - |', ...rows, ''].join('\n');

function fixture(mutate = () => {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'decisions-'));
  const files = {
    'template.md': '---\nstatus: proposed\n---\n',
    '0001-first-thing.md': RECORD(1),
    '0002-second-thing.md': RECORD(2),
    'README.md': README(['| 0001 | [First](0001-first-thing.md) | accepted |', '| 0002 | [Second](0002-second-thing.md) | accepted |']),
  };
  mutate(files);
  for (const [name, text] of Object.entries(files)) if (text !== null) fs.writeFileSync(path.join(dir, name), text);
  return dir;
}
const check = (mutate, opts = {}) => validateDecisionRecords({ dir: fixture(mutate), ...opts });
const has = (problems, text) => assert.ok(problems.some((p) => p.includes(text)), `expected a problem containing "${text}", got: ${JSON.stringify(problems)}`);

test('a valid set of records has no problems', () => {
  assert.deepEqual(check(() => {}, { requireRepos: true }), []);
});
test('a missing directory is a problem', () => has(validateDecisionRecords({ dir: '/nonexistent-decisions-dir' }), 'does not exist'));
test('README.md and template.md are required', () => {
  has(check((f) => { f['README.md'] = null; }), 'README.md is missing');
  has(check((f) => { f['template.md'] = null; }), 'template.md is missing');
});
test('file names must be NNNN-short-title.md', () => has(check((f) => { f['0003_Bad Name.md'] = RECORD(3); }), 'the name must be NNNN-short-title.md'));
test('numbers must be unique and contiguous', () => {
  has(check((f) => { f['0001-other-thing.md'] = RECORD(1); }), 'used twice');
  has(check((f) => { f['0004-gap.md'] = RECORD(4); }), 'contiguous');
});
test('front matter is required and strict', () => {
  has(check((f) => { f['0001-first-thing.md'] = 'no front matter\n'; }), 'must start with a front matter block');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('status: accepted\n', ''); }), 'missing front matter key "status"');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('date: 2026-10-24', 'date: 2026-02-30'); }), 'real YYYY-MM-DD date');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('status: accepted', 'status: maybe'); }), 'must be one of');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('date: 2026-10-24\n', 'date: 2026-10-24\nowner: me\n'); }), 'unknown front matter key');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('decision-makers:\n  - maintainers', 'decision-makers: maintainers'); }), 'must be a list');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('status: accepted', 'status: accepted\nstatus: proposed'); }), 'duplicate key');
});
test('repos is required only when asked', () => {
  const noRepos = (f) => { f['0001-first-thing.md'] = RECORD(1).replace('repos:\n  - rockcarver/frodo-cli\n', ''); };
  assert.deepEqual(check(noRepos), []);
  has(check(noRepos, { requireRepos: true }), 'missing front matter key "repos"');
});
test('superseded records must name an existing, different record', () => {
  const sup = (to) => (f) => { f['0001-first-thing.md'] = RECORD(1, { status: `superseded by ${to}` }); f['README.md'] = README([`| 0001 | [First](0001-first-thing.md) | superseded by ${to} |`, '| 0002 | [Second](0002-second-thing.md) | accepted |']); };
  assert.deepEqual(check(sup('0002')), []);
  has(check(sup('0009')), 'which does not exist');
  has(check(sup('0001')), 'cannot supersede itself');
});
test('the body needs a title and the three sections in order, each with content', () => {
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('# Record 1', 'Record 1'); }), 'must start with a "# Title"');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('## Decision', '## Outcome'); }), 'unknown section');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace(/## Consequences[\s\S]*/, ''); }), 'missing section "## Consequences"');
  assert.deepEqual(check((f) => { f['0001-first-thing.md'] = RECORD(1) + '\n## Known deviations\n\nSee 0002.\n\n## Alternatives considered\n\nNone.\n'; }), []);
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('## Consequences', '## Known deviations\n\nEarly.\n\n## Consequences'); }), 'out of order');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('## Decision\n\nWhat.\n\n## Consequences\n\nSo what.\n', '## Consequences\n\nSo what.\n\n## Decision\n\nWhat.\n'); }), 'out of order');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1).replace('What.', ''); }), 'is empty');
});
test('records stay short and carry no credentials', () => {
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1) + 'filler\n'.repeat(70); }), 'longer than');
  has(check((f) => { f['0001-first-thing.md'] = RECORD(1) + 'token ghp_' + 'a'.repeat(30) + '\n'; }), 'credential');
});
test('the README index lists every record with its status and nothing else', () => {
  has(check((f) => { f['README.md'] = README(['| 0001 | [First](0001-first-thing.md) | accepted |']); }), 'no row linking 0002-second-thing.md');
  has(check((f) => { f['README.md'] = README(['| 0001 | [First](0001-first-thing.md) | proposed |', '| 0002 | [Second](0002-second-thing.md) | accepted |']); }), 'does not show the status');
  has(check((f) => { f['README.md'] = README(['| 0001 | [First](0001-first-thing.md) | accepted |', '| 0002 | [Second](0002-second-thing.md) | accepted |', '| 0003 | [Ghost](0003-ghost.md) | accepted |']); }), 'which does not exist');
});
