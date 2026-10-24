# Frodo

> **This repository no longer takes issues, pull requests or code.** Frodo lives in two repositories. Please report problems and ask for features there:
>
> - **Command line:** [frodo-cli, report an issue or ask for a feature](https://github.com/rockcarver/frodo-cli/issues/new/choose)
> - **Library:** [frodo-lib, report an issue or ask for a feature](https://github.com/rockcarver/frodo-lib/issues/new/choose)
>
> Report a suspected vulnerability privately, as described in each repository's security policy ([frodo-cli](https://github.com/rockcarver/frodo-cli/security/policy), [frodo-lib](https://github.com/rockcarver/frodo-lib/security/policy)). Do not open a public issue for it.

Frodo is a command line interface (CLI) and a JavaScript library to manage PingOne Advanced Identity Cloud environments, and Ping (heritage ForgeRock) platform deployments: both ForgeOps and classic deployments based on PingAM, PingIDM and PingDS.

| | [frodo-cli](https://github.com/rockcarver/frodo-cli) | [frodo-lib](https://github.com/rockcarver/frodo-lib) |
| - | - | - |
| **What it is** | A command line interface to export, import and manage configuration: journeys, scripts, applications, email templates, IDM configuration, environment secrets and variables, realms, connection profiles, logs and more. Powered by frodo-lib. | A hybrid (ESM and CommonJS) JavaScript library that powers the CLI. |
| **Choose it if** | You manage deployments from a shell, or automate with shell scripts and CI/CD tooling, and do not plan to write your own code. | You write your own tooling to automate Ping platform deployments. |
| **Install** | See below. | `npm i @rockcarver/frodo-lib` ([package](https://www.npmjs.com/package/@rockcarver/frodo-lib)) |
| **Documentation** | [README](https://github.com/rockcarver/frodo-cli#readme) | [README](https://github.com/rockcarver/frodo-lib#readme) |
| **Releases** | [GitHub](https://github.com/rockcarver/frodo-cli/releases), [npm](https://www.npmjs.com/package/@rockcarver/frodo-cli) | [GitHub](https://github.com/rockcarver/frodo-lib/releases), [npm](https://www.npmjs.com/package/@rockcarver/frodo-lib) |
| **Report an issue or ask for a feature** | [frodo-cli issues](https://github.com/rockcarver/frodo-cli/issues) | [frodo-lib issues](https://github.com/rockcarver/frodo-lib/issues) |

## Install the CLI

- **Homebrew** (macOS, Linux): `brew tap rockcarver/frodo-cli`, then `brew install frodo-cli`. For the 5.x preview, `brew install frodo-cli-next`. The formulas live in the [homebrew-frodo-cli](https://github.com/rockcarver/homebrew-frodo-cli) tap.
- **Binaries** (Windows, macOS, Linux): download the archive for your platform from the [release page](https://github.com/rockcarver/frodo-cli/releases).
- **npm** (requires Node.js 26 or later): `npm i -g @rockcarver/frodo-cli`. For the latest pre-release, `npm i @rockcarver/frodo-cli@next`.

The library's pre-release is `npm i @rockcarver/frodo-lib@next`.

## What is new in 5.x

Frodo 5.x is in pre-release. The CLI and library READMEs list what changed and what breaks, in "New In 5.x" and in the `MIGRATION.md` file of each repository. Highlights in the CLI: self-contained native binaries, interactive commands that fill in missing input conversationally, and a built-in [MCP](https://modelcontextprotocol.io/) server (`frodo mcp server start`) so MCP-compatible clients can operate on a deployment you have already saved as a connection profile.

## Contribute and maintain

- Contributing: [frodo-cli](https://github.com/rockcarver/frodo-cli/blob/main/docs/CONTRIBUTE.md), [frodo-lib](https://github.com/rockcarver/frodo-lib/blob/main/CONTRIBUTE.md).
- Maintaining (release pipelines): [frodo-cli](https://github.com/rockcarver/frodo-cli/blob/main/docs/PIPELINE.md), [frodo-lib](https://github.com/rockcarver/frodo-lib/blob/main/PIPELINE.md).
- Design decisions that bind a repository are recorded in its repository: [frodo-cli](https://github.com/rockcarver/frodo-cli/tree/main/docs/decisions), [frodo-lib](https://github.com/rockcarver/frodo-lib/tree/main/decisions).
- Security: please report a suspected vulnerability privately, as described in each repository's security policy ([frodo-cli](https://github.com/rockcarver/frodo-cli/security/policy), [frodo-lib](https://github.com/rockcarver/frodo-lib/security/policy)). Do not open a public issue for it.

## History

Frodo started as a single repository, [rockcarver/frodo](https://github.com/rockcarver/frodo). The releases of that original architecture (v1.0.1 and older) remain available there; v2.0.0 and newer come from the two repositories above.
