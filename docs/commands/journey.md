# `journey` command
The journey command can list, export, import, prune and describe journeys in a specific realm. You can view all options by using `frodo help journey` command.

## Examples

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
