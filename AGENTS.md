# Frodo (umbrella repository): instructions for coding agents

This repository is the front door of the Frodo project: a `README.md` that describes the two products and links to them, and the **decision records** that bind more than one repository. It has no code and no build.

- [frodo-cli](https://github.com/rockcarver/frodo-cli): the command line interface (`@rockcarver/frodo-cli`).
- [frodo-lib](https://github.com/rockcarver/frodo-lib): the library (`@rockcarver/frodo-lib`) that powers the CLI.
- [homebrew-frodo-cli](https://github.com/rockcarver/homebrew-frodo-cli): the Homebrew tap that installs the CLI.

Each of those repositories has its own `AGENTS.md`; read it before changing anything there.

## Rules

- **Keep `README.md` short and accurate.** It says what the products are and where to get them. Do not copy documentation that lives in the other repositories.
- **A decision that binds several repositories is a record here.** Copy `docs/decisions/template.md`, number it, add it to the index in `docs/decisions/README.md` and list the repositories it binds under `repos:`. Check it with `node .github/scripts/validate-decision-records.mjs docs/decisions --repos`; CI runs the same check.
- **Never commit credentials, keys or tokens**, and keep tenant names, security-incident details and personal information out of records: everything here is public.

## Decisions

Accepted records in `docs/decisions/` are binding for humans and agents until a newer record supersedes them. If your task conflicts with one, stop and say so in the issue or pull request instead of working around it. Records are not edited after acceptance (typos aside): a changed decision is a new record that supersedes the old one, in the same pull request that changes the behaviour. The index is in [docs/decisions/README.md](docs/decisions/README.md).

Cross-repo decisions in this repository:

- 0001 [A maintainer stays the last lever on agent work](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0001-a-maintainer-stays-the-last-lever-on-agent-work.md)
- 0002 [Guidance for agents and contributors lives in the repository](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0002-guidance-for-agents-and-contributors-lives-in-the-repository.md)
- 0003 [The Repo Concierge runs the issue, plan and PR gates](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0003-the-repo-concierge-runs-the-issue-plan-and-pr-gates.md)
- 0004 [Releases are started by a maintainer through the pipeline](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0004-releases-are-started-by-a-maintainer-through-the-pipeline.md)
- 0005 [Published packages have no runtime dependencies](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0005-published-packages-have-no-runtime-dependencies.md)
- 0006 [The public API is only the frodo facade](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0006-public-api-only-through-the-frodo-facade.md)
- 0007 [Homebrew installs prebuilt release binaries](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0007-homebrew-installs-prebuilt-release-binaries.md)
- 0008 [Let the callback handler return a promise](https://github.com/rockcarver/frodo/blob/main/docs/decisions/0008-let-the-callback-handler-return-a-promise.md) (proposed)
