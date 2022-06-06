# Frodo - ForgeROck DO

This is the ForgeROck DO - or short frodo - command line interface, a CLI to manage ForgeRock platform deployments. Frodo supports Identity Cloud tenants, ForgeOps deployments, and classic deployments.

Frodo is the successor to field tools like [amtree.sh](https://github.com/vscheuber/AM-treetool), [fidc-debug-tools](https://github.com/vscheuber/fidc-debug-tools), and ForgeRock-internal utilities.

## Quick start

1. Download you platform specific binary zip from the [release page](https://github.com/rockcarver/frodo/releases) and unzip it to a directory.
2. Open a terminal and change to the above directory.
3. Run `frodo info` (example below) to setup `frodo` for your ForgeRock environment. If all parameters are correct, `frodo` will connect, print information about the environment on the console and also save the connection details.
```console
$ frodo info https://openam-example-use1-dev.id.forgerock.io/am username@example.com 5uP3r-53cr3t
Printing versions and tokens...
ForgeRock Identity Cloud detected.
Connected to ForgeRock Access Management 7.2.0-2022-4-SNAPSHOT Build 28162a406361e4d7a92a37c15bb1f8d6b6da7f90 (2022-May-04 20:45)
Cookie name: 27e1d6427df2a07
Session token: w7nvv <snip> IwMQ..*
Bearer token: eyJ0eXAiOiJKV1QiL <snip> 68SEpHUg
```
**NOTE: MacOS and Windows may not let you run `frodo` right after you download (and unzip) and execute it for the very first time. Please refer to [this page](binaries.md) if this happens.**

4. Now you can use other frodo commands, like `journey`, `logs`, `applications` etc. as desired. **For detailed usage, refer to [this](#usage)**

## Quick Nav

- [Features](#features)
- [Limitations](#limitations)
- [Installing](#installing)
- [Usage](#usage)
- [Request features or report issues](#feature-requests)
- [Contributing](#contributing)
- [Developing](#developing)

## Features

Frodo allows an administrator to easily connect to and manage any number of Identity Cloud tenants, ForgeOps deployment instances, or classic deployment instances from the command line. The following tasks are currently supported:

- User mode

  Install and run pre-compiled single binaries without any dependencies for MacOS, Windows, and Linux.

- Manage journeys/trees.

  Export, import and pruning of journeys. Frodo handles referenced scripts and email templates.

- Manage applications.

  List, export, and import applications (OAuth2 clients).

- Manage connection profiles.

  Saving and reading credentials (for multiple ForgeRock deployments) from a configuration file.

- Manage email templates.

  List, export, and import email templates.

- Manage IDM configuration.

  Export of IDM configuration. Import is coming.

- Print versions and tokens.

  Obtain ForgeRock session token and admin access_tokens for a ForgeRock Identity Cloud or platform (ForgeOps) deployment

- View Identity Cloud logs.

  List available log sources and tail them.

- Manage realms.

  List realms and show realm details. Allow adding and removing of custom DNS names.

- Manage scripts.

  List, export, and import scripts.

- Manage Identity Cloud secrets.

  List and view details of secrets in Identity Cloud (Note: the nature of secrets does not allow the value to be retrieved, therefore the details only inlude other information about the secret, not the value of the secret).

- Platform admin tasks.

  Common tasks administrators need to perform daily that are tedious and repetitive. Advanced tasks, which used to be involved and potentially dangerous if performed manually, now made easy and safe.

  - Create an oauth2 client with admin privileges.
  - Get an access token using client credentials grant type.
  - List oauth2 clients with admin privileges.
  - Grant an oauth2 client admin privileges.
  - Revoke admin privileges from an oauth2 client.
  - List oauth2 clients with custom privileges.
  - List all subjects of static user mappings that are not oauth2 clients.
  - Remove a subject's static user mapping.
  - Add AutoId static user mapping to enable dashboards and other AutoId-based functionality.
  - Hide generic extension attributes.
  - Show generic extension attributes.
  - Repair org model (beta).

- Developer mode

  Install and run in developer mode (npm i -g)

## Limitations

`frodo` can't export passwords (including API secrets, etc), so these need to be manually added back to an imported tree or alternatively, export the source tree to a file, edit the file to add the missing fields before importing. Any dependencies _other than_ scripts and email templates, needed for a journey/tree, must also exist prior to import, for example inner-trees and custom nodes.

## Installing

### User Mode
Individuals who do not intend to develop or contribute to frodo should use this method. Please refer to [Quick Start](#quick-start)

### Developer Mode
For those who want to contribute or are just curious about the build process.

- Make sure you have Node.js v18 (the version used by developers) or newer and npm.
- Clone this repo
```console
git clone https://github.com/rockcarver/frodo.git
```
- Install via NPM
```console
cd frodo
npm install
npm i -g
```

## Usage

You can invoke `frodo` from the terminal as long as you're in the directory or sourced/added it to the path.

To get started run the command below to get tenant info. This command will also create a connection file and stores it on disk, more on connections later.

```console
frodo info https://openam-example-use1-dev.id.forgerock.io/am <username> <password>
```

Once `frodo` saves a connection, you don't have to provide the `host`, `username`, and `password` arguments. You can reference your connection using any unique substring from your host

```console
frodo info example-use1-dev
```

You interact with `frodo` using commands and options. You can see the list of options by using the `help` command

```console
frodo help
```

```console
Usage: frodo [options] [command]

Options:
  -v, --version                            output the version number
  -h, --help                               display help for command

Commands:
  connections                              Manage connection profiles.
  info [options] <host> [user] [password]  Print versions and tokens.
  journey                                  Manage journeys/trees.
  script                                   Manage scripts.
  idm                                      Manage IDM configuration.
  logs <host>                              View Identity Cloud logs.
  help [command]                           display help for command
```

Or to view options for a specific command

```console
frodo help journey
```

```console
Usage: frodo journey [options] [command]

Manage journeys/trees.

Options:
  -h, --help                                            Help

Commands:
  list [options] <host> [realm] [user] [password]       List all the journeys/trees in a realm.
  describe [options] [host] [realm] [user] [password]   If -h is supplied, describe the journey/tree indicated by -t, or all journeys/trees in the realm if no -t is supplied, otherwise describe the journey/tree export file
                                                        indicated by -f.
  export [options] <host> [realm] [user] [password]     Export journeys/trees.
  import [options] <host> [realm] [user] [password]     Import journey/tree.
  importAll [options] <host> [realm] [user] [password]  Import all the trees in a realm.
  prune [options] <host> [realm] [user] [password]      Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.
  help [command]                                        display help for command
```

```console
frodo journey help export
```

```console
Usage: frodo journey export [options] <host> [realm] [user] [password]

Export journeys/trees.

Arguments:
  host               Access Management base URL, e.g.: https://cdk.iam.example.com/am. To use a connection profile, just specify a unique substring.
  realm              Realm. Specify realm as '/' for the root realm or 'realm' or '/parent/child' otherwise. (default: "__default__realm__")
  user               Username to login with. Must be an admin user with appropriate rights to manage authentication journeys/trees.
  password           Password.

Options:
  -m, --type <type>  Override auto-detected deployment type. Valid values for type: [Classic] - A classic Access Management-only deployment with custom layout and configuration. [Cloud] - A ForgeRock Identity Cloud
                     environment. [ForgeOps] - A ForgeOps CDK or CDM deployment. The detected or provided deployment type controls certain behavior like obtaining an Identity Management admin token or not and whether to
                     export/import referenced email templates or how to walk through the tenant admin login flow of Identity Cloud and handle MFA (choices: "classic", "cloud", "forgeops")
  -t, --tree <tree>  Name of a journey/tree. If specified, -a and -A are ignored.
  -f, --file <file>  Name of the file to write the exported journey(s) to. Ignored with -A.
  -a, --all          Export all the journeys/trees in a realm. Ignored with -t.
  -A, --allSeparate  Export all the journeys/trees in a realm as separate files <journey/tree name>.json. Ignored with -t or -a.
  -h, --help         Help
```

### Commands
Detailed information on each command

- [connections](docs/commands/connections.md)
- [idm](docs/commands/idm.md)
- [info](docs/commands/info.md)
- [journey](docs/commands/journey.md)
- [logs](docs/commands/logs.md)

## Feature requests
Please use the repository's [issues](https://github.com/rockcarver/frodo/issues) to request new features/enhancements or report bugs/issues.

## Contributing
If you would like to contribute to frodo, please refer to [contribution instrctions](docs/contribute.md).
