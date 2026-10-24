# Frodo (umbrella repository): instructions for coding agents

This repository is the front door of the Frodo project: a `README.md` that describes the two products and links to them, and the **decision records** that bind more than one repository. It has no code and no build.

- [frodo-cli](https://github.com/rockcarver/frodo-cli): the command line interface (`@rockcarver/frodo-cli`).
- [frodo-lib](https://github.com/rockcarver/frodo-lib): the library (`@rockcarver/frodo-lib`) that powers the CLI.
- [homebrew-frodo-cli](https://github.com/rockcarver/homebrew-frodo-cli): the Homebrew tap that installs the CLI.

Each of those repositories has its own `AGENTS.md`; read it before changing anything there.

## Rules

- **The library is the brain, the CLI is a thin wrapper** (record 0001): business logic belongs in frodo-lib behind the `frodo` facade, the library stays free of terminal and other interface code, the CLI adapts it (interface-specific stacks such as the interactive mode are legitimate CLI code), and a new capability is built library first.
- **Keep `README.md` short and accurate.** It says what the products are and where to get them. Do not copy documentation that lives in the other repositories.
- **A decision that binds several repositories is a record here.** Copy `docs/decisions/template.md`, number it, add it to the index in `docs/decisions/README.md` and list the repositories it binds under `repos:`. Then add its one-sentence row to the cross-repo table in `docs/decisions/README.md` of each repository it binds, in the same change set: the Repo Concierge's gates read one repository only and never this one. Check it with `node .github/scripts/validate-decision-records.mjs docs/decisions --repos`; CI runs the same check.
- **Never commit credentials, keys or tokens**, and keep tenant names, security-incident details and personal information out of records: everything here is public.

## Procedures

Recurring work is written down as agent skills in `.claude/skills/` (read by Claude Code and by the Copilot coding agent). For a decision that binds several repositories: [record-a-decision](.claude/skills/record-a-decision/SKILL.md).

## Decisions

Accepted records in `docs/decisions/` are binding for humans and agents until a newer record supersedes them. If your task conflicts with one, stop and say so in the issue or pull request instead of working around it. Records are not edited after acceptance (typos aside): a changed decision is a new record that supersedes the old one, in the same pull request that changes the behaviour. The index is in [docs/decisions/README.md](docs/decisions/README.md).

Cross-repo decisions in this repository:

- 0001 [The library is the brain, the CLI is a thin wrapper](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0001-library-is-the-brain-cli-is-a-thin-wrapper.md)
- 0002 [A maintainer stays the last lever on agent work](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0002-a-maintainer-stays-the-last-lever-on-agent-work.md)
- 0003 [Guidance for agents and contributors lives in the repository](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0003-guidance-for-agents-and-contributors-lives-in-the-repository.md)
- 0004 [The Repo Concierge runs the issue, plan and PR gates](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0004-the-repo-concierge-runs-the-issue-plan-and-pr-gates.md)
- 0005 [Releases are started by a maintainer through the pipeline](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0005-releases-are-started-by-a-maintainer-through-the-pipeline.md)
- 0006 [Published packages have no runtime dependencies](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0006-published-packages-have-no-runtime-dependencies.md)
- 0007 [The public API is only the frodo facade](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0007-public-api-only-through-the-frodo-facade.md)
- 0008 [Homebrew installs prebuilt release binaries](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0008-homebrew-installs-prebuilt-release-binaries.md)
- 0009 [Let the callback handler return a promise](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0009-let-the-callback-handler-return-a-promise.md) (proposed)
- 0010 [Both repositories use one toolchain: tsdown, ESLint 10 with Prettier, and TypeScript 5.9](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0010-one-toolchain-tsdown-eslint-prettier-typescript-5-9.md)
- 0011 [Dependency updates merge automatically only when they are patch or minor](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0011-dependency-updates-merge-automatically-only-for-patch-and-minor.md)
- 0012 [Merging into main is gated by a small, stable set of required checks](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0012-merging-is-gated-by-a-stable-set-of-required-checks.md)
- 0013 [Secrets are never exported in the clear, and stored credentials are encrypted](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0013-secrets-are-never-exported-in-the-clear.md)
- 0014 [The recording framework stays on Polly until Node 28 or a real breakage forces a change](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0014-the-recording-framework-stays-on-polly-for-now.md)
- 0015 [Published packages ship only an allowlist of files](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0015-published-packages-ship-only-an-allowlist-of-files.md)
- 0016 [Changes that are not code still run the checks that validate them](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0016-changes-that-are-not-code-still-run-the-checks-that-validate-them.md)
- 0017 [Security reports and fixes are handled privately by a maintainer](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0017-security-reports-and-fixes-are-handled-privately-by-a-maintainer.md)
