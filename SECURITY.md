# Security policy

## Reporting a vulnerability

Please report a suspected vulnerability privately, with GitHub's private vulnerability reporting: open the **Security** tab of the repository and choose **Report a vulnerability** ([direct link](https://github.com/rockcarver/frodo/security/advisories/new)).

Do not open a public issue or pull request for a suspected vulnerability.

Include, as far as you can:

- the affected repository and version,
- the steps to reproduce it, ideally a small working proof of concept,
- the impact, and
- who controls the input that triggers it (see the threat model below).

## Scope and threat model

This repository holds documentation and the decision records that bind several Frodo repositories. It contains no code that runs for users. The code lives in the repositories below, and each publishes its own policy and threat model:

- [frodo-cli](https://github.com/rockcarver/frodo-cli/security/policy): the command line interface and its MCP server
- [frodo-lib](https://github.com/rockcarver/frodo-lib/security/policy): the library
- [homebrew-frodo-cli](https://github.com/rockcarver/homebrew-frodo-cli/security/policy): the Homebrew tap

Report a problem in one of those to that repository. Report a problem with this repository's content, workflows or settings here.

## Out of scope

- Reports that need control of the operator's own machine, command line, environment, connection profiles or files. The person who runs Frodo is trusted.
- Automated scanner output without a working proof of concept.
- Vulnerabilities in third-party dependencies that Dependabot already tracks. Please report those upstream.

## What to expect

Frodo is maintained by a small team of volunteers. We answer on a best-effort basis, handle confirmed vulnerabilities through a private advisory, and disclose them after a fix is released. We credit the reporter if they want to be named.

## Unsolicited fix pull requests

We read a pull request that claims to fix a security problem before we run any automated checks on it, and we may close it without merging. Please report the problem privately instead.
