# `info` command
Prints version information, session token, access token, and tokenId to `STDOUT`. This command is also a good starting point to setup `frodo` for a ForgeRock environment, as it validates the environment's URL and admin credentials and if they are correct, saves them in `~/.frodo/.frodorc` for later use. Multiple ForgeRock environments can be saved in this manner. One may specify one of these saved environments for all `frodo` commands or, one can also provide new environment details for commands (those details will be saved if the command was successful).

## Examples

```console
frodo info acme
```

```console
frodo info <https://login.acme.forgeblocks.io/am> <username> <password>
```

## Sample output

```console
Printing versions and tokens...
ForgeRock Identity Cloud detected.
Connected to ForgeRock Access Management 7.2.0-2021-11-SNAPSHOT Build 978ae0d483aa2da07826b3bdff286c60ccb41a4e (2022-February-09 11:40)
Cookie name: <tenant-cookie-name>
Session token: <your-session-token>
Bearer token: <your-bearer-token>
```
