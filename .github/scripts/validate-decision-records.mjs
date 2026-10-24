#!/usr/bin/env node
// Validates decision records (see decisions/README.md or docs/decisions/README.md).
// No dependencies. Usage: node validate-decision-records.mjs <dir> [--repos]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STATUSES = ['proposed', 'accepted', 'rejected', 'deprecated'];
const KEYS = ['status', 'date', 'decision-makers', 'applies-to', 'issues', 'repos'];
const LIST_KEYS = new Set(['decision-makers', 'applies-to', 'issues', 'repos']);
const SECTIONS = [
  'Context and problem statement',
  'Decision',
  'Consequences',
  'Known deviations',
  'Alternatives considered',
];
const REQUIRED_SECTIONS = SECTIONS.slice(0, 3);
const MAX_LINES = 60;
const RECORD_FILE = /^(\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const SECRET =
  /(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})/;

/** Splits a record into its front matter (flat keys, lists as "- item" lines) and body. */
export function parseFrontMatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return { error: 'must start with a front matter block (---)' };
  const end = lines.indexOf('---', 1);
  if (end < 0) return { error: 'front matter is not closed with ---' };
  const data = {};
  let list = null;
  for (const line of lines.slice(1, end)) {
    if (line.trim() === '') continue;
    const item = line.match(/^\s+-\s+(.*\S)\s*$/);
    if (item) {
      if (!list) return { error: `list item outside a list: "${line.trim()}"` };
      list.push(item[1]);
      continue;
    }
    const kv = line.match(/^([a-z-]+):\s*(.*?)\s*$/);
    if (!kv) return { error: `cannot read front matter line: "${line}"` };
    if (kv[1] in data) return { error: `duplicate key "${kv[1]}"` };
    if (kv[2] === '') {
      list = [];
      data[kv[1]] = list;
    } else {
      list = null;
      data[kv[1]] = kv[2];
    }
  }
  return { data, body: lines.slice(end + 1) };
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Returns a list of problems, empty when every record is valid. */
export function validateDecisionRecords({ dir, requireRepos = false }) {
  const problems = [];
  if (!fs.existsSync(dir)) return [`${dir} does not exist`];
  const all = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  for (const required of ['README.md', 'template.md']) {
    if (!all.includes(required)) problems.push(`${required} is missing`);
  }
  const records = [];
  for (const file of all) {
    if (file === 'README.md' || file === 'template.md') continue;
    const m = file.match(RECORD_FILE);
    if (!m) {
      problems.push(`${file}: the name must be NNNN-short-title.md (lower case, hyphens)`);
      continue;
    }
    records.push({ file, number: Number(m[1]) });
  }
  const numbers = records.map((r) => r.number);
  numbers.forEach((n, i) => {
    if (numbers.indexOf(n) !== i) problems.push(`number ${String(n).padStart(4, '0')} is used twice`);
  });
  [...new Set(numbers)].sort((a, b) => a - b).forEach((n, i) => {
    if (n !== i + 1) problems.push(`numbers must be contiguous from 0001: expected ${String(i + 1).padStart(4, '0')}, found ${String(n).padStart(4, '0')}`);
  });
  const numberSet = new Set(numbers);
  const readme = all.includes('README.md') ? fs.readFileSync(path.join(dir, 'README.md'), 'utf8') : '';
  const statusOf = {};
  for (const { file, number } of records) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const fail = (msg) => problems.push(`${file}: ${msg}`);
    if (text.split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length > MAX_LINES) fail(`longer than ${MAX_LINES} lines`);
    if (SECRET.test(text)) fail('looks like it contains a credential');
    const fm = parseFrontMatter(text);
    if (fm.error) {
      fail(fm.error);
      continue;
    }
    const { data, body } = fm;
    for (const key of Object.keys(data)) {
      if (!KEYS.includes(key)) fail(`unknown front matter key "${key}"`);
      else if (LIST_KEYS.has(key) !== Array.isArray(data[key])) fail(`"${key}" must be ${LIST_KEYS.has(key) ? 'a list' : 'a single value'}`);
      else if (Array.isArray(data[key]) && data[key].length === 0) fail(`"${key}" must not be empty`);
    }
    for (const key of ['status', 'date', 'decision-makers', ...(requireRepos ? ['repos'] : [])]) {
      if (!(key in data)) fail(`missing front matter key "${key}"`);
    }
    if (typeof data.status === 'string') {
      statusOf[file] = data.status;
      const sup = data.status.match(/^superseded by (\d{4})$/);
      if (sup) {
        if (!numberSet.has(Number(sup[1]))) fail(`superseded by ${sup[1]}, which does not exist`);
        else if (Number(sup[1]) === number) fail('cannot supersede itself');
      } else if (!STATUSES.includes(data.status)) {
        fail(`status "${data.status}" must be one of ${STATUSES.join(', ')} or "superseded by NNNN"`);
      }
    }
    if (typeof data.date === 'string' && !validDate(data.date)) fail(`date "${data.date}" must be a real YYYY-MM-DD date`);
    const first = body.find((l) => l.trim() !== '');
    if (!first || !/^# \S/.test(first)) fail('the body must start with a "# Title" heading');
    const headings = body.filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());
    for (const h of headings) if (!SECTIONS.includes(h)) fail(`unknown section "## ${h}"`);
    for (const h of REQUIRED_SECTIONS) if (!headings.includes(h)) fail(`missing section "## ${h}"`);
    const order = headings.filter((h) => SECTIONS.includes(h)).map((h) => SECTIONS.indexOf(h));
    if (order.some((v, i) => i > 0 && v <= order[i - 1])) fail('sections are out of order or repeated');
    body.forEach((l, i) => {
      if (!/^## /.test(l)) return;
      const rest = body.slice(i + 1);
      const next = rest.findIndex((x) => /^## /.test(x));
      const content = (next < 0 ? rest : rest.slice(0, next)).filter((x) => x.trim() !== '');
      if (content.length === 0) fail(`section "${l.trim()}" is empty`);
    });
  }
  for (const { file } of records) {
    const row = readme.split('\n').find((l) => l.includes(`(${file})`));
    if (!row) problems.push(`README.md: the index has no row linking ${file}`);
    else if (statusOf[file] && !row.includes(statusOf[file])) problems.push(`README.md: the index row for ${file} does not show the status "${statusOf[file]}"`);
  }
  for (const link of readme.matchAll(/\((\d{4}-[a-z0-9-]+\.md)\)/g)) {
    if (!records.some((r) => r.file === link[1])) problems.push(`README.md: the index links ${link[1]}, which does not exist`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] || 'docs/decisions';
  const problems = validateDecisionRecords({ dir, requireRepos: process.argv.includes('--repos') });
  for (const p of problems) console.error(`::error::${p}`);
  console.log(problems.length === 0 ? `decision records in ${dir}: ok` : `${problems.length} problem(s) in ${dir}`);
  process.exit(problems.length === 0 ? 0 : 1);
}
