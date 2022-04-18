# Frodo - ForgeROck DO

This is the ForgeROck DO - or short frodo - command line interface, a CLI to manage ForgeRock platform deployments. Frodo supports Identity Cloud tenants, ForgeOps deployments, and classic deployments.

Frodo is the successor to field tools like [amtree.sh](https://github.com/vscheuber/AM-treetool), [fidc-debug-tools](https://github.com/vscheuber/fidc-debug-tools), and ForgeRock-internal utilities.

## Quick Nav

- [Features](#features)
- [Limitations](#limitations)
- [Installing](#installing)
- [Usage](#usage)
- [Contributing](#contributing)
- [Developing](#developing)

## Features

Frodo allows an administrator to easily connect to and manage any number of Identity Cloud tenants, ForgeOps deployment instances, or classic deployment instances from the command line. The following tasks are currently supported:

- Developer mode

  Install and run in developer mode (npm i -g)

- CI/CD mode

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

## Limitations

`frodo` can't export passwords (including API secrets, etc), so these need to be manually added back to an imported tree or alternatively, export the source tree to a file, edit the file to add the missing fields before importing. Any dependencies _other than_ scripts and email templates, needed for a journey/tree, must also exist prior to import, for example inner-trees and custom nodes.

## Installing

### Prerequisites

Node 17 or newer and npm.

### CI/CD Mode

Get the latest binaries from the [release page](https://github.com/rockcarver/frodo/releases).

The binaries for Windows and MacOS might require you to grant permission to run, as they are not yet distributed through official channels appropriate for each respective OS.

### Developer Mode

#### Clone this repo

```console
git clone git@github.com:rockcarver/frodo.git
```

#### Install via NPM

```console
cd frodo
npm i -g
```

## Usage

You can invoke `frodo` from the terminal as long as you're in the directory or sourced/added it to the path.

To get started run the command below to get tenant info. This command will also create a connection file and stores it on disk, more on connections later.

```console
frodo info https://login.acme.forgeblocks.io/am <username> <password>
```

Once `frodo` saves a connection, you don't have to provide the `host`, `username`, and `password` arguments. You can reference your connection using any unique substring from your host

```console
frodo info acme
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

- [connections](#connections)
- [idm](#idm)
- [info](#info)
- [journey](#journey)
- [logging](#logging)

#### Connections

Use this command to list, add, or delete your connections. `frodo` saves connection info automatically when you use other commands like in our `info` command.

##### Examples

List saved connections

```console
frodo connections list
```

##### Sample output

The command displays the connections found in the **`frodorc`** file, located in `$USERHOME/.frodo/.frodorc`.

```console
[Host] : [Username]
- [https://login.acme.com/am] : [username]
Any unique substring of a saved host can be used as the value for host parameter in all commands
```

#### IDM

This command is all about IDM configurations. It supports list, export, and import of IDM entities as well as additional commands available via the help argument. The command supports the same connection persistance we discussed above.

##### Examples

List IDM configuration objects. You'll notice that we don't need to specific the realm here and we're reading from existing connection info

```console
frodo idm list acme
```

Or by supplying the host, username, and password

```console
frodo idm list https://login.acme.forgeblocks.io/am <username> <password>
```

###### Sample output

```console
Listing all IDM configuration objects...
ForgeRock Identity Cloud detected.
Connected to ForgeRock Access Management 7.2.0-2021-11-SNAPSHOT Build 978ae0d483aa2da07826b3bdff286c60ccb41a4e (2022-February-09 11:40)
- script
- emailTemplate/frPasswordUpdated
- emailTemplate/registration
- secrets
- servletfilter/payload
- emailTemplate/baselineEmailVerification
```

Exports IDM configuration in JSON format to a file or `STDOUT` if you don't specify the file option. The `-N` option is the name of the configuration object

```console
frodo idm export acme -N <configuration-name> -f <file-name.json>
```

```console
frodo idm export https://login.acme.forgeblocks.io/am <username> <password> -N <configuration-name> -f <file-name.json>
```

#### Info

`info` prints version information, session token, access token, and tokenId to `STDOUT`.

##### Examples

```console
frodo info acme
```

```console
frodo info <https://login.acme.forgeblocks.io/am> <username> <password>
```

##### Sample output

```console
Printing versions and tokens...
ForgeRock Identity Cloud detected.
Connected to ForgeRock Access Management 7.2.0-2021-11-SNAPSHOT Build 978ae0d483aa2da07826b3bdff286c60ccb41a4e (2022-February-09 11:40)
Cookie name: <tenant-cookie-name>
Session token: <your-session-token>
Bearer token: <your-bearer-token>
```

#### Journey

The journey command can list, export, import, prune and describe journeys in a specific realm. You can view all options by using `frodo help journey` command.

#### Examples

These examples assume a saved connection

List all Journeys in a realm

```console
frodo journey list acme <realm-name>
```

Export a specific journey. If you don't supply the `-f` options `frodo` will generate a filename based on the journey name

```console
frodo journey export acme <realm-name> -t <journey-name>
```

Import a Journey from a `JSON` file

```console
frodo journey import acme <realm-name> -t <journey-name> -f <file-name>
```

#### Logging

Todo

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what and why you'd like to change.

## Developing

### Prerequisites

Node 17 or newer and npm (included with node)

### Process

#### Clone this repo

```console
cd $HOME # or any other directory you wish to clone to
git clone git@github.com:rockcarver/frodo.git
```

#### Install via NPM

```console
cd $HOME/frodo
npm i -g
```

frodo will be installed as a global npm package. This method is helpful when developing and testing.

#### Build

To build locally we need to do a couple of extra steps due to a limitation with the `pkg` module we're using to distribute binaries. `pkg` [doesn't support ES6](https://github.com/vercel/pkg/issues/1291) modules as of yet, so we have to transpile to commonJS then build.

There should be a `dist` folder when you cloned the repo from Github, the binaries will get pushed there. We're using a `gulp` script to transpile ES6 module to commonJS and then `pkg` can create the binary for the respective OS. For Mac OS you'll have to sign the binary

##### For windows and Linux

```console
cd $HOME/frodo
npm install
npm install -g pkg gulp
gulp
cd ./dist
npm i
#For Windows
pkg -C Gzip -t node16-win-x64 --out-path bin/win .
#For Linux
pkg -C Gzip -t node16-linux-x64 --out-path bin/linux .
```

##### For MacOS

For MacOS we need to sign the binaries with an Apple Developer Cert.

```console
# create variables
CERTIFICATE_PATH=<YOUR_CERTIFICATE_PATH>
INTERMEDIATE_CERTIFICATE_PATH=<YOUR_INTERMEDIATE_CERTIFICATE_PATH>
KEYCHAIN_PATH=<YOUR_TEMP_KEYCHAIN_PATH>
KEYCHAIN_PASSWORD=<KEY_CHAIN_PASSWORD>
DEVELOPMENT_CERTIFICATE_PASSPHRASE=<YOUR_CERT_PASSPHRASE>

#create temp keychain
security create-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH
security set-keychain-settings -lut 21600 $KEYCHAIN_PATH
security unlock-keychain -p "$KEYCHAIN_PASSWORD" $KEYCHAIN_PATH

#import certs to keychain
security import $CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security import $INTERMEDIATE_CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security list-keychain -d user -s $KEYCHAIN_PATH

# import certificate to keychain
security import $CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security import $INTERMEDIATE_CERTIFICATE_PATH -P "$DEVELOPMENT_CERTIFICATE_PASSPHRASE" -A -t cert -f pkcs12 -k $KEYCHAIN_PATH
security list-keychain -d user -s $KEYCHAIN_PATH

cd $HOME/frodo
npm install
npm install -g pkg gulp
gulp

cd ./dist
npm i
pkg -C Gzip -t node16-macos-x64 --out-path bin/macos .

cd ./dist/bin/macos
codesign -f -s 'DEV_ID' --timestamp --deep frodo
```

This will build `frodo` in each local directory respective to the OS target you chose

```console
./dist/bin/linux/frodo
./dist/bin/macos/frodo
./dist/bin/win/frodo
```

#### Run

`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:

```console
$HOME/frodo/frodo # or the platform equivalent binary
```

We recommend sourcing, or adding it to the path if you're on windows, to make it easier to call from your terminal without switching directories
