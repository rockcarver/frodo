#!/usr/bin/env node
// Validates the agent skills in .claude/skills (read by Claude Code and by GitHub's Copilot coding agent).
// A skill is a folder with a SKILL.md: single-line front matter (name, description) and Markdown steps
// that an agent follows literally, so it must not name a file or a command script that does not exist.
// No dependencies. Usage: node validate-skills.mjs [repository root]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILLS_DIR = '.claude/skills';
const KEYS = ['name', 'description', 'disable-model-invocation', 'license'];
const MAX_DESCRIPTION = 1000;
const MAX_BODY_LINES = 500;
const MAINTAINER_LINE =
  '**Only run when a maintainer asks. If you are a coding agent without the needed access, stop and say so in the issue or pull request.**';
const REPO_PATH = /^(?:\.claude\/|\.github\/|docs\/|AGENTS\.md$|README\.md$)/;
const SECRET =
  /(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})/;

/** Splits a SKILL.md into its front matter (single-line "key: value" only) and body. */
export function parseSkill(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { error: 'must start with a front matter block (---) and close it with ---' };
  const data = {};
  for (const line of m[1].split('\n')) {
    if (line.trim() === '') continue;
    const kv = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*?)\s*$/);
    if (!kv) return { error: `front matter line is not a single-line "key: value": "${line.slice(0, 60)}"` };
    data[kv[1]] = kv[2];
  }
  return { data, body: m[2] };
}

/** Returns a list of problems in the skills under `root`, empty when every skill is valid. */
export function validateSkills({ root }) {
  const problems = [];
  const base = path.join(root, SKILLS_DIR);
  if (!fs.existsSync(base)) return problems;
  for (const entry of fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const dir = `${SKILLS_DIR}/${entry.name}`;
    const fail = (msg) => problems.push(`${dir}: ${msg}`);
    const file = path.join(root, dir, 'SKILL.md');
    if (!fs.existsSync(file)) {
      fail('SKILL.md is missing');
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    const parsed = parseSkill(text);
    if (parsed.error) {
      fail(parsed.error);
      continue;
    }
    const { data, body } = parsed;
    for (const key of Object.keys(data)) if (!KEYS.includes(key)) fail(`unknown front matter key "${key}" (${KEYS.join(', ')})`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.name ?? '') || data.name.length > 64) fail(`name "${data.name}" must be lower case letters, digits and hyphens, at most 64 characters`);
    else if (data.name !== entry.name) fail(`name "${data.name}" must equal the folder name "${entry.name}"`);
    if (!data.description) fail('description is missing: it decides when the skill is used');
    else if (data.description.length >= MAX_DESCRIPTION) fail(`description is ${data.description.length} characters, the limit is ${MAX_DESCRIPTION - 1}`);
    if (body.split('\n').length >= MAX_BODY_LINES) fail(`the body is ${body.split('\n').length} lines, the limit is ${MAX_BODY_LINES - 1}`);
    if (SECRET.test(text)) fail('looks like it contains a credential');
    if (data['disable-model-invocation'] === 'true' && body.split('\n').find((l) => l.trim() !== '') !== MAINTAINER_LINE) {
      fail(`a skill that is not loaded by the model on its own must open with: ${MAINTAINER_LINE}`);
    }
    for (const link of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = link[1].split('#')[0];
      if (target && !/^[a-z][a-z0-9+.-]*:/i.test(target) && !fs.existsSync(path.resolve(root, dir, target))) fail(`the link ${link[1]} does not resolve`);
    }
    for (const span of body.matchAll(/`([^`\n]+)`/g)) {
      const token = span[1].trim();
      if (REPO_PATH.test(token) && !/[*<>{}$\s]/.test(token) && !fs.existsSync(path.join(root, token))) fail(`\`${token}\` does not exist in the repository`);
    }
    for (const run of body.matchAll(/\bnode\s+(\.?[\w./-]+\.(?:mjs|js))/g)) {
      if (!fs.existsSync(path.join(root, run[1]))) fail(`the command "node ${run[1]}" names a file that does not exist`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || '.');
  const problems = validateSkills({ root });
  for (const p of problems) console.error(`::error::${p}`);
  console.log(problems.length === 0 ? 'agent skills: ok' : `${problems.length} problem(s) in the agent skills`);
  process.exit(problems.length === 0 ? 0 : 1);
}
