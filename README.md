# Forgerock Do (frodo)

This is the ForgeROck DO (frodo) CLI executable. This is a statically linked binary which can be cross compiled for multiple platforms (Linux, MacOS, Windows etc.).

## Features

### Current

- Obtain ForgeRock session token and admin access_tokens for a ForgeRock Identity Cloud or platform (ForgeOps) deployment
- Saving and reading credentials (for multiple ForgeRock deployments) from a configuration file.
- Export, import and pruning of journeys. Export includes scripts referenced by scripted decision nodes and when used with Identity Cloud or ForgeOps, `frodo` also includes Email Templates referenced by the Email Template or Email Suspend nodes.
- Export of IDM configuration
- Configuring a ForgeRock cloud tenant for a specific use case, also called a "recipe"

### Future

- Importing IDM configuration
- Parameter substitution when exporting and importing IDM configuration
- Export and import of other ForgeRock ID Cloud configurations, like OAuth clients, SAML entities etc.
- Export and import of data in ForgeRock ID Cloud

## Limitations

`frodo` can't export passwords (including API secrets, etc), so these need to be manually added back to an imported tree or alternatively, export the source tree to a file, edit the file to add the missing fields before importing. Any dependencies _other than_ scripts and email templates, needed for a journey/tree, must also exist prior to import, for example inner-trees and custom nodes.

## Getting the binaries

Links to the executables

## Usage

Depending on your OS, you can invoke `frodo`, `frodo` or `frodo.exe` binary.
`frodo` uses commands and sub-commands to provide the functionality stated above. All commands support the help argument as such

```shell
frodo journey -h
```

```shell
Usage: frodo journey [options] [command]

Manage journeys/trees.
  ```

### Commands

- [connections](#connections)
- [idm](#idm)
- [info](#info)
- [journey](#journey)
- [logging](#logging)

#### Connections

Use this command to list, add, or delete your connections. The CLI creates connection configurations automatically when you use other commands, so you don't have to run this command to initiate a connection.

##### Examples

List saved connections

```shell
frodo connections list
```

##### Sample output

The command displays the connections found in the **`frodorc`** file, located in the user's directory.

```shell
[Host] : [Username]
- [https://openam-ali-demo.forgeblocks.com/am] : [ali.falahi@forgerock.com]
Any unique substring of a saved host can be used as the value for host parameter in all commands
```

The command below lists all journeys in the specified realm, but the main idea here is when you supply the `host`, `username`, and `password` frodo will automatically save the connection in the **`$USERHOME/.frodo/.frodorc`** file. The `password` value will be encrypted with `AES-256-GCM`

```shell
frodo journey list https://<tenant-url>/am <realm> <username> <password>
```

One the connection is saved, you don't need to include the `host`, `username`, and `password` in your future commands. You'll simply use a substring in your tenant/forgerock deployment domain name to define the connection. For example, if your tenant name is `https://login.acme.forgeblocks.com/am`

**`acme`** is a unique substring in your tenant url, and if it's unique across your saved connections then this enables frodo to execute the same command from above like:

```shell
frodo journey list acme
```

**`frodo`** will automatically parse this unique string, and check your saved connections for a match. It will then use the connection details to authenticate and list journeys.

#### IDM

This command is all about IDM configurations. It supports list, export, and import of IDM entities as well as additional commands available via the help argument. The command supports the same connection persistance we discussed above.

##### Examples

List IDM configuration objects. You'll notice that we don't need to specific the realm here and we're reading from existing connection info

```shell
frodo idm list acme
```

Or by supplying the host, username, and password

```shell
frodo idm list https://<tenant-url>/am <username> <password>
```

###### Sample output

```shell
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

```shell
frodo idm export acme -N <configuration-name> -f <file-name.json>
```

```shell
frodo idm export https://<tenant-url>/am <username> <password> -N <configuration-name> -f <file-name.json>
```

#### Info

`info` prints version information, session token, access token, and tokenId to `STDOUT`.

##### Examples

```shell
frodo info acme
```

```shell
frodo info <https://idc.iam.example.com/am> <username> <password>
```

##### Sample output

```shell
Printing versions and tokens...
ForgeRock Identity Cloud detected.
Connected to ForgeRock Access Management 7.2.0-2021-11-SNAPSHOT Build 978ae0d483aa2da07826b3bdff286c60ccb41a4e (2022-February-09 11:40)
Cookie name: <tenant-cookie-name>
Session token: <your-session-token>
Bearer token: <your-bearer-token>
```

#### Journey

The journey command can list, export, import, prune and describe journeys in a specific realm. You can view all options and argument by using the `help` command. This command can export all journey in a given `realm`, specific journeys, or even all journeys as separate `JSON` files.

#### Examples

These examples assume a saved connection

List all Journeys in a realm

```shell
frodo journey list acme <realm-name>
```

Export a specific journey

```shell
frodo journey export acme <realm-name> -t <journey-name>
```

Import a Journey from a `JSON` file

```shell
frodo journey import <unique-connection-name> <realm-name> -t <journey-name> -f <file-name>
```

#### Logging

Todo

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what and why you'd like to change.

## Developing

### Prerequisites

- Install nodejs (tested on v14.9.0 and 16.13.0) and npm (included with node)

### Process

- Clone this repo

```shell
cd $HOME # or any other directory you wish to clone to
git clone git@github.com:rockcarver/frodo.git
```

- Install via NPM

```shell
cd $HOME/frodo
npm install
npm i -g
```

frodo will be installed as a global npm package. This method is helpful when developing and testing.

- Build

```shell
cd $HOME/frodo
npm install
npm install -g pkg
pkg -C GZip .
```

This will build `frodo` in local directory. There are three binaries created

```shell
frodo-linux
frodo-macos
frodo-win.exe
```

### Run

`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:

```shell
$HOME/frodo/frodo # or the platform equivalent binary
```

We recommending sourcing or adding it to the path if you're on windows to make it easier to call from your terminal without switching directories
