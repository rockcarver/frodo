---
status: accepted
date: 2026-10-24
decision-makers:
  - maintainers
applies-to:
  - src/ops/**
repos:
  - rockcarver/frodo-lib
  - rockcarver/frodo-cli
---

# The library is the brain, the CLI is a thin wrapper

## Context and problem statement

Frodo is two repositories that must behave as one product. frodo-lib is the library; frodo-cli is the command line on top of it, and other consumers (scripts, the MCP server (`frodo mcp server`, whose capability registry lives in frodo-lib's `src/mcp/`), third-party tools) use the library directly. Logic that lives only in the CLI cannot be reused by them, drifts from the library, and has to be written twice. This record states the principle the project was built on; it is recorded retroactively.

## Decision

- **Business logic, API calls, data handling and configuration management belong in frodo-lib**, behind the `frodo` facade. Anything a script, an MCP server or another tool needs must be reachable through the facade.
- **The CLI adds terminal concerns only**: argument parsing, prompts and interactive mode, output formatting, files, stdin and exit codes, and packaging (npm, native binary, Homebrew).
- **The CLI's ops layer (`src/ops/`) is a thin wrapper** over the facade plus those terminal concerns. A command file stays thinner still: it parses, calls an ops function and sets the exit code.
- **A new capability is built library first**: add it to frodo-lib and the facade, release it, then wrap it in the CLI. The CLI never reimplements, copies or works around a library function.

## Consequences

- A contributor adding a feature that needs data or tenant behaviour starts in frodo-lib (a facade method with tests there) and only then adds the command, its prompts and its output in frodo-cli. A feature needing both ships as a library change first.
- A reviewer rejects a CLI change that adds API calls, data transformation or configuration logic which another consumer would also need, and asks for it to move into the library.
- Terminal code stays in the CLI: frodo-lib has no prompt library and no `process.exit`. Where it needs input from a person (journey callbacks, for example) it takes a callback from the caller.
- The library's public surface is only the facade (see 0007), so the CLI can rely on it as the one way in.

## Known deviations

The CLI does not follow this everywhere yet: config-manager keeps substantial logic in the CLI, in a separate `configManagerOps` layer outside `src/ops`. Deviations are recorded in later records that reference this one, not here, so this record stays stable.
