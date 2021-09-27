const {
    Command,
    Option
} = require('commander');

module.exports = {
    hostOption: new Option("-h, --host <host>", "Access Management host URL, e.g.: https://login.example.com/openam"),
    userOption: new Option("-u, --user <user>", "Username to login with. Must be an admin user \
with appropriate rights to manages authentication trees"),
    passwordOption: new Option("-p, --password <password>", "Password"),
    realmOption: new Option("-r, --realm <realm>", "Realm. If not specified, the root realm '/' is assumed. \
Specify realm as '/parent/child'. If using 'amadmin' as the user, login \
will happen against the root realm but subsequent operations will be \
performed in the realm specified. For all other users, login and subsequent \
operations will occur against the realm specified"),
    treeOption: new Option("-t, --tree <tree>", "Specify the name of an authentication tree. Mandatory in \
combination with the following actions: -i, -e, -d"),
    fileOption: new Option("-f, --file <file>", "If supplied, export/list to and import from <file> instead \
of stdout and stdin. For -S, use as file prefix"),
    deploymentOption: new Option("-m <type>", "Override auto-detected deployment type. Valid values for type: \
[Classic] - A classic Access Management-only deployment with custom layout and configuration. \
[Cloud] - A ForgeRock Identity Cloud environment. \
[ForgeOps] - A ForgeOps CDK or CDM deployment. \
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and skip MFA").choices(['Classic', 'Cloud', 'ForgeOps']),
    noReUUIDOption: new Option("-n", "No Re-UUID, i.e., import does not generate new UUIDs \
for (inner)nodes. Used to update existing trees/nodes instead of cloning them."),
    versionOption: new Option("-o <version>", "Override version. Notation: 'X.Y.Z' e.g. '7.1.0'. Override detected version \
with any version. This is helpful in order to check if journeys in one environment would be compatible running \
in another environment (e.g. in preparation of migrating from on-prem to ForgeRock Identity Cloud. Only impacts \
these actions: -d, -l.")
}