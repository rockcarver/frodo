# `connections` command
Use this command to list, add, or delete your connections. `frodo` saves connection info automatically when you use other commands like in our `info` command.

## Examples

List saved connections

```console
frodo connections list
```

## Sample output

The command displays the connections found in the **`frodorc`** file, located in `$USERHOME/.frodo/.frodorc`.

```console
[Host] : [Username]
- [https://login.acme.com/am] : [username]
Any unique substring of a saved host can be used as the value for host parameter in all commands
```
