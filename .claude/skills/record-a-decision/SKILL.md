---
name: record-a-decision
description: Write a cross-repository decision record in the Frodo umbrella repository: a lasting decision that binds more than one of frodo-cli, frodo-lib, the Homebrew tap and this repository. Use when a decision, an agreement or a recurring review finding should be written down once for several repositories, or when a record here must be superseded. Covers numbering, the front matter with `repos:`, the index, the validator, and the links every bound repository's AGENTS.md needs. A decision for one repository belongs in that repository's own records instead.
---

A decision record says what we chose and why, so the next contributor or coding agent does not decide it again, differently. Records here are **public** and bind several repositories at once. The rules for the folder are in [docs/decisions/README.md](../../../docs/decisions/README.md) and the format in [docs/decisions/template.md](../../../docs/decisions/template.md); this skill is the procedure. Read [0003 Guidance for agents and contributors lives in the repository](../../../docs/decisions/0003-guidance-for-agents-and-contributors-lives-in-the-repository.md) first: it is the reason every bound repository must link the record.

## Does it belong here?

- **Here** when it binds at least two of frodo-cli, frodo-lib, homebrew-frodo-cli and this repository (the library/CLI split, release rules, how the gates and agents are used). It lists them under `repos:`.
- **Not here** when it concerns one repository: it goes in that repository's own `docs/decisions/` (frodo-lib: `decisions/` at the root, because its `docs/` is generated). Use that repository's `record-a-decision` skill if it has one.
- Only lasting decisions get a record: something you would be surprised to see reversed without discussion. Not implementation notes, not a routine refactor.
- Read the index first. If an accepted record already covers it, do not write a second one; if you are changing it, that is a supersede (below).

## Stop and ask a maintainer when

- the record would contain anything that is not public: credentials, tenant names or hostnames, details of a security incident or an unpatched weakness, personal information, partner or commercial context, personal preferences, internal cost figures. Leave it out and say in the pull request that you left something out and why. Do not publish it "to be safe" and delete it later: history keeps it.
- you are about to mark a record `accepted` and the maintainer has not said the decision is taken. Write `status: proposed`; a maintainer accepts it.
- the draft contradicts an accepted record and nobody has said it should replace it.

## Steps

1. **Pick the number.** Numbers are contiguous from 0001; take the next one.

```bash
ls docs/decisions | grep -E '^[0-9]{4}-' | tail -1
cp docs/decisions/template.md docs/decisions/NNNN-short-title.md
```

   The file name is `NNNN-short-title.md`: lower case, hyphens. If another pull request takes the same number, the validator fails on the second one to merge: rebase and renumber before you merge.

2. **Fill in the front matter.** `status` is `proposed`, `accepted`, `rejected`, `deprecated` or `superseded by NNNN`. `date` is the day the decision was taken (for a record written after the fact, the day the practice began; say "Recorded retroactively" in the context, as 0004 does). `decision-makers` are roles (`maintainers`), not names. `repos:` is required here and lists full names (`rockcarver/frodo-cli`). `applies-to:` (path globs in the bound repositories) and `issues:` (`owner/repo#123`) are optional; delete a key you do not use, an empty list fails the check.

3. **Write the body**, under 40 lines (the hard limit is 60), in this order:
   - `# Title` stated as the decision ("Releases are started by a maintainer through the pipeline"), not as a topic.
   - `## Context and problem statement`: two or three sentences on what forced the decision. No history lesson.
   - `## Decision`: rules a contributor or agent can check a change against.
   - `## Consequences`: what changes, what gets harder, what is deliberately not decided.
   - Optional, after those: `## Known deviations` (where reality does not match the decision yet, so nobody mistakes the gap for permission) and `## Alternatives considered`.
   Replace every placeholder: the validator does not read the content, so an untouched template text still passes.

4. **Add the row to the index** in `docs/decisions/README.md`: copy an existing row and give it the number, the title as a link to the new file, the status and the repositories (short names). The row must link the file and show the same status as the front matter.

5. **Validate.**

```bash
node .github/scripts/validate-decision-records.mjs docs/decisions --repos
node --test .github/scripts/validate-decision-records.test.mjs
```

   CI runs both (workflow `Decision records`). The first checks the file name, contiguous numbers, the front matter, the sections and their order, the length, that no credential-looking text is present and that the index matches.

6. **Update the repository's own `AGENTS.md`** here (the list under "Cross-repo decisions in this repository"), then open the pull request. The gates read one repository only and never this one, so a record that the bound repositories do not state in their own files is invisible to their agents.

7. **State it in every bound repository**, in a small pull request each, after this one is merged (the link is to `main` and would not resolve before). Each repository has a "Decisions that span repositories" table in its decisions README (`docs/decisions/README.md`, in frodo-lib `decisions/README.md`) with one row per record: the record number as a link, the rule in one sentence, the status. Find the table in each repository:

```bash
gh api -H 'Accept: application/vnd.github.raw+json' repos/rockcarver/frodo-cli/contents/docs/decisions/README.md | grep -n 'rockcarver/frodo/blob'
```

   Add a row with the same link form (`https://github.com/rockcarver/frodo/blob/main/docs/decisions/NNNN-short-title.md`); a `proposed` record is marked proposed. If the rule is one every change must know (day-to-day work, not a one-off), add one sentence for it to that repository's `AGENTS.md` too, within its line budget (60 lines). The Concierge gates read the records of the repository they run in, so the table row is how an agent finds a cross-repository decision.

## Changing a decision

An accepted record is never edited, except for typos and its `status:` line. To change the decision, write a new record that says in its context which one it replaces, and in the same pull request set the old record's status to `superseded by NNNN` and update its index row. Update the lists in `AGENTS.md` files in the follow-up pull requests. A pull request that changes a decided behaviour adds or supersedes a record in the same change.

## The pull request

Say what the decision is, who took it (roles), which repositories it binds, which `AGENTS.md` follow-ups are needed, and what you left out as not public. Do not mark your own record accepted and do not merge it: a maintainer does.

## Pitfalls

- A record written as history ("we discussed...") instead of as rules. Write what a contributor must or must not do.
- Two numbers in one pull request, or a gap in the numbering: the validator fails.
- A title that names a topic ("Release process") instead of the decision: the index becomes unreadable.
- Listing a repository in `repos:` that has not agreed. A record binds the repositories it names; ask first.
