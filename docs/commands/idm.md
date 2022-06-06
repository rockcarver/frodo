# `idm` command
This command is all about IDM configurations. It supports list, export, and import of IDM entities as well as additional commands available via the help argument. The command supports the same connection persistance we discussed above.

## Examples

List IDM configuration objects. You'll notice that we don't need to specific the realm here and we're reading from existing connection info

```console
frodo idm list acme
```

Or by supplying the host, username, and password

```console
frodo idm list https://login.acme.forgeblocks.io/am <username> <password>
```

## Sample output

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
