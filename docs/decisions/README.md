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

Copy `template.md` to `NNNN-short-title.md` (the next number), fill it in (aim for under 40 lines) and add a row to the index. Besides the three required sections, a record may have `## Known deviations` (where reality does not yet match the decision) and `## Alternatives considered`. `node .github/scripts/validate-decision-records.mjs docs/decisions --repos` checks the folder; CI runs the same check.

## Index

| # | Title | Status | Repos |
| - | - | - | - |
| 0001 | [The library is the brain, the CLI is a thin wrapper](0001-library-is-the-brain-cli-is-a-thin-wrapper.md) | accepted | frodo-lib, frodo-cli |
| 0002 | [A maintainer stays the last lever on agent work](0002-a-maintainer-stays-the-last-lever-on-agent-work.md) | accepted | frodo-cli, frodo-lib |
| 0003 | [Guidance for agents and contributors lives in the repository](0003-guidance-for-agents-and-contributors-lives-in-the-repository.md) | accepted | frodo-cli, frodo-lib, homebrew-frodo-cli, frodo |
| 0004 | [The Repo Concierge runs the issue, plan and PR gates](0004-the-repo-concierge-runs-the-issue-plan-and-pr-gates.md) | accepted | frodo-cli, frodo-lib |
| 0005 | [Releases are started by a maintainer through the pipeline](0005-releases-are-started-by-a-maintainer-through-the-pipeline.md) | accepted | frodo-cli, frodo-lib |
| 0006 | [Published packages have no runtime dependencies](0006-published-packages-have-no-runtime-dependencies.md) | accepted | frodo-cli, frodo-lib |
| 0007 | [The public API is only the frodo facade](0007-public-api-only-through-the-frodo-facade.md) | accepted | frodo-cli, frodo-lib |
| 0008 | [Homebrew installs prebuilt release binaries](0008-homebrew-installs-prebuilt-release-binaries.md) | accepted | frodo-cli, homebrew-frodo-cli |
| 0009 | [Let the callback handler return a promise](0009-let-the-callback-handler-return-a-promise.md) | proposed | frodo-cli, frodo-lib |
