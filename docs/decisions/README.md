# Decision records

A decision record explains one lasting decision: why we chose it, what it means and what we gave up. Records are plain Markdown in the repository, so every contributor and every coding agent, whatever tool it uses, reads the same thing.

This folder holds the decisions that **span repositories** (frodo-cli, frodo-lib, the Homebrew tap and this repository). Decisions that concern a single repository live in that repository's own `docs/decisions/` (frodo-lib: `decisions/`). Each repository's `AGENTS.md` lists the records here that bind it.

## Rules

- An accepted record is binding for humans and agents until a newer record supersedes it. An agent whose task conflicts with one stops and says so in the issue or pull request.
- Only lasting decisions get a record: something you would be surprised to see reversed without discussion. Not minor implementation notes or routine refactors.
- An accepted record is not edited, except for typos. A changed decision is a new record: set the old record's status to `superseded by NNNN` and update the index.
- A pull request that changes a decided behaviour adds or supersedes a record in the same pull request.
- Records are public. No credentials, tenant names, security-incident details or personal information.
- `repos:` lists the repositories a record binds. `applies-to:` lists path globs, where that helps.

## Writing one

Copy `template.md` to `NNNN-short-title.md` (the next number), fill it in (aim for under 40 lines) and add a row to the index. `node .github/scripts/validate-decision-records.mjs docs/decisions --repos` checks the folder; CI runs the same check.

## Index

| # | Title | Status | Repos |
| - | - | - | - |
| 0001 | [A maintainer stays the last lever on agent work](0001-a-maintainer-stays-the-last-lever-on-agent-work.md) | accepted | frodo-cli, frodo-lib |
| 0002 | [Guidance for agents and contributors lives in the repository](0002-guidance-for-agents-and-contributors-lives-in-the-repository.md) | accepted | frodo-cli, frodo-lib, homebrew-frodo-cli, frodo |
| 0003 | [The Repo Concierge runs the issue, plan and PR gates](0003-the-repo-concierge-runs-the-issue-plan-and-pr-gates.md) | accepted | frodo-cli, frodo-lib |
| 0004 | [Releases are started by a maintainer through the pipeline](0004-releases-are-started-by-a-maintainer-through-the-pipeline.md) | accepted | frodo-cli, frodo-lib |
| 0005 | [Published packages have no runtime dependencies](0005-published-packages-have-no-runtime-dependencies.md) | accepted | frodo-cli, frodo-lib |
| 0006 | [The public API is only the frodo facade](0006-public-api-only-through-the-frodo-facade.md) | accepted | frodo-cli, frodo-lib |
| 0007 | [Homebrew installs prebuilt release binaries](0007-homebrew-installs-prebuilt-release-binaries.md) | accepted | frodo-cli, homebrew-frodo-cli |
| 0008 | [Let the callback handler return a promise](0008-let-the-callback-handler-return-a-promise.md) | proposed | frodo-cli, frodo-lib |
