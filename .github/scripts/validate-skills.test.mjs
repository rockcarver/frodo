import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkill, validateSkills } from './validate-skills.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MAINTAINER = '**Only run when a maintainer asks. If you are a coding agent without the needed access, stop and say so in the issue or pull request.**';

const skill = ({ front = {}, body = 'Read [the index](../../../docs/decisions/README.md) and `docs/decisions/README.md`.\n\n```bash\nnode .github/scripts/check.mjs\n```\n' } = {}) => {
  const meta = { name: 'do-it', description: 'Do the thing. Use when asked to.', ...front };
  const lines = Object.entries(meta).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n\n${body}`;
};

/** A small repository with one good skill; `overrides` replace or add files (null removes one). */
function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-'));
  const files = {
    'docs/decisions/README.md': '# Decisions\n',
    '.github/scripts/check.mjs': '// check\n',
    '.claude/skills/do-it/SKILL.md': skill(),
    ...overrides,
  };
  for (const [name, text] of Object.entries(files)) {
    if (text === null) continue;
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), text);
  }
  return root;
}
const check = (overrides) => validateSkills({ root: fixture(overrides) });
const withSkill = (text) => ({ '.claude/skills/do-it/SKILL.md': text });
const has = (problems, text) => assert.ok(problems.some((p) => p.includes(text)), `expected a problem containing "${text}", got: ${JSON.stringify(problems)}`);

test('the skills in this repository are valid', () => assert.deepEqual(validateSkills({ root: ROOT }), []));
test('a repository without skills is fine', () => assert.deepEqual(validateSkills({ root: fs.mkdtempSync(path.join(os.tmpdir(), 'noskills-')) }), []));
test('a valid skill has no problems', () => assert.deepEqual(check({}), []));
test('SKILL.md is required', () => has(check({ '.claude/skills/do-it/SKILL.md': null, '.claude/skills/do-it/notes.md': 'x\n' }), 'SKILL.md is missing'));
test('front matter is required and single-line', () => {
  has(check(withSkill('# no front matter\n')), 'must start with a front matter block');
  has(check(withSkill('---\nname: do-it\ndescription: |\n  two lines\n---\nbody\n')), 'single-line');
  assert.ok(parseSkill('---\nname: a\n---\nb\n').data);
});
test('unknown front matter keys are rejected, allowed-tools included', () => has(check(withSkill(skill({ front: { 'allowed-tools': 'Bash' } }))), 'unknown front matter key "allowed-tools"'));
test('the name equals the folder and is lower case with hyphens', () => {
  has(check(withSkill(skill({ front: { name: 'other' } }))), 'must equal the folder name');
  has(check(withSkill(skill({ front: { name: 'Do_It' } }))), 'must be lower case');
  const long = 'a'.repeat(65);
  has(check({ '.claude/skills/do-it/SKILL.md': null, [`.claude/skills/${long}/SKILL.md`]: skill({ front: { name: long } }) }), 'at most 64 characters');
});
test('the description is required and shorter than 1000 characters', () => {
  has(check(withSkill(skill({ front: { description: undefined } }))), 'description is missing');
  has(check(withSkill(skill({ front: { description: 'x'.repeat(1000) } }))), 'description is 1000 characters');
  assert.deepEqual(check(withSkill(skill({ front: { description: 'x'.repeat(999) } }))), []);
});
test('the body is shorter than 500 lines', () => {
  has(check(withSkill(skill({ body: 'line\n'.repeat(498) }))), 'the body is 500 lines');
  assert.deepEqual(check(withSkill(skill({ body: 'line\n'.repeat(497) }))), []);
});
test('a credential-looking text is rejected', () => has(check(withSkill(skill({ body: `${'ghp_'}${'a'.repeat(30)}\n` }))), 'credential'));
test('a skill that only a person starts opens with the maintainer line', () => {
  const front = { 'disable-model-invocation': 'true' };
  has(check(withSkill(skill({ front, body: 'Do it.\n' }))), 'must open with');
  assert.deepEqual(check(withSkill(skill({ front, body: `\n${MAINTAINER}\n\nDo it.\n` }))), []);
});
test('links, repository paths and node scripts must exist', () => {
  has(check(withSkill(skill({ body: 'See [x](../../../docs/missing.md).\n' }))), 'does not resolve');
  has(check(withSkill(skill({ body: 'See `docs/missing.md`.\n' }))), 'does not exist in the repository');
  has(check(withSkill(skill({ body: '```bash\nnode .github/scripts/missing.mjs\n```\n' }))), 'names a file that does not exist');
  assert.deepEqual(check(withSkill(skill({ body: 'See [web](https://example.com/x), `docs/<name>.md` and `docs/*.md`.\n' }))), []);
});
