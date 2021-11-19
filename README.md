Very basic README for now...

This is the ForgeROckDO (frodo) cli executable. This is a statically linked binary which can be cross compiled for multiple platforms (linux, MacOS, Windows etc.).

# Features
## Current
- Obtain ForgeRock session token and admin access_tokens for a ForgeRock deployment
- Saving and reading credentials (for multiple ForgeRock deployments) from a configuration file. For 
- Export, import and pruning of journeys. Export includes scripts referenced by scripted decision nodes and when used with Identity Cloud or ForgeOps, `frodo` also includes Email Templates referenced by the Email Template or Email Suspend nodes.
- Export of IDM configuration
- Configuring a ForgeRock cloud tenant for a specific use case, also called a "recipe"

## Future
- Importing IDM configuration
- Parameter substitution when exporting and importing IDM configuration
- Export and import of other ForgeRock ID Cloud configurations, like OAuth clients, SAML entities etc.
- Export and import of data in ForgeRock ID Cloud

## Limitations
`frodo` can't export passwords (including API secrets, etc), so these need to be manually added back to an imported tree or alternatively, export the source tree to a file, edit the file to add the missing fields before importing. Any dependencies _other than_ scripts and email templates, needed for a journey/tree, must also exist prior to import, for example inner-trees and custom nodes.

# Quick start
Depending on your OS, you can invoke `frodo-linux`, `frodo-macos` or `frodo-windows.exe` binary.
`frodo` uses commands and sub-commands to provide the functionality stated above.

## Examples
### Export a journey
```
$ ./frodo-linux journey -h https://<forgerock-cloud-tenant>/am -u <tenant.admin@tenant.com> -p my_5up3rs3cr3tp@ssw0rd export -t Registration -r alpha -f Registration.json
```
This will export a journey named `Registration` in `alpha` realm and save the contents in a file called `journey-Registration.json`. If the `-f <filename>` is omitted, the journey JSON data is dumped to STDOUT.

### Import a journey
```
$ ./frodo-linux journey -h https://<forgerock-cloud-tenant>/am -u <tenant.admin@tenant.com> -p my_5up3rs3cr3tp@ssw0rd import -t ImportTest -r alpha -f journey-ImportTest.json
```
The above will import the same journey.

# Developing
## Prerequisites
- Install nodejs (tested on v14.9.0) and npm (included with node)

## Process
- Clone this repo
```
cd $HOME # or any other directory you wish to clone to
git clone git@github.com:rockcarver/frodo.git
```
- Build
```
cd $HOME/frodo
npm install
pkg -C GZip .
```
This will build `frodo` in local directory. There are three binaries created
```
frodo-linux
frodo-macos
frodo-win.exe
```

# Run
`frodo` is self contained, statically linked, so no dependencies should be needed. It can be run as:
```
$HOME/frodo/frodo-linux # or the platform equivalent binary
```
