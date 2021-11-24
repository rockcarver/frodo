const {
    Option
} = require('commander');

const hostOption = new Option("-h, --host <host>", "Access Management host URL, e.g.: https://login.example.com/openam");
const hostOptionM = new Option("-h, --host <host>", "Access Management host URL, e.g.: https://login.example.com/openam");
const userOption = new Option("-u, --user <user>", "Username to login with. Must be an admin user \
with appropriate rights to manages authentication trees");
const userOptionM = new Option("-u, --user <user>", "Username to login with. Must be an admin user \
with appropriate rights to manages authentication trees");
const passwordOption = new Option("-p, --password <password>", "Password");
const passwordOptionM = new Option("-p, --password <password>", "Password")
const realmOption = new Option("-r, --realm <realm>", "Realm. If not specified, the root realm '/' is assumed. \
Specify realm as '/parent/child'. If using 'amadmin' as the user, login \
will happen against the root realm but subsequent operations will be \
performed in the realm specified. For all other users, login and subsequent \
operations will occur against the realm specified");
const realmOptionM = new Option("-r, --realm <realm>", "Realm. If not specified, the root realm '/' is assumed. \
Specify realm as '/parent/child'. If using 'amadmin' as the user, login \
will happen against the root realm but subsequent operations will be \
performed in the realm specified. For all other users, login and subsequent \
operations will occur against the realm specified");
const treeOption = new Option("-t, --tree <tree>", "Specify the name of an authentication tree. Mandatory in \
combination with the following actions: -i, -e, -d");
const treeOptionM = new Option("-t, --tree <tree>", "Specify the name of an authentication tree. Mandatory in \
combination with the following actions: -i, -e, -d");
const fileOption = new Option("-f, --file <file>", "If supplied, export/list to and import from <file> instead \
of stdout and stdin. For -S, use as file prefix");
const fileOptionM = new Option("-f, --file <file>", "If supplied, export/list to and import from <file> instead \
of stdout and stdin. For -S, use as file prefix");
const deploymentOption = new Option("-m, --type <type>", "Override auto-detected deployment type. Valid values for type: \
[Classic] - A classic Access Management-only deployment with custom layout and configuration. \
[Cloud] - A ForgeRock Identity Cloud environment. \
[ForgeOps] - A ForgeOps CDK or CDM deployment. \
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and skip MFA").choices(['Classic', 'Cloud', 'ForgeOps']);
const deploymentOptionM = new Option("-m, --type <type>", "Override auto-detected deployment type. Valid values for type: \
[Classic] - A classic Access Management-only deployment with custom layout and configuration. \
[Cloud] - A ForgeRock Identity Cloud environment. \
[ForgeOps] - A ForgeOps CDK or CDM deployment. \
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and skip MFA").choices(['Classic', 'Cloud', 'ForgeOps']);
const noReUUIDOption = new Option("-n", "No Re-UUID, i.e., import does not generate new UUIDs \
for (inner)nodes. Used to update existing trees/nodes instead of cloning them.");
const noReUUIDOptionM = new Option("-n", "No Re-UUID, i.e., import does not generate new UUIDs \
for (inner)nodes. Used to update existing trees/nodes instead of cloning them.");
const versionOption =  new Option("-o, --version <version>", "Override version. Notation: 'X.Y.Z' e.g. '7.1.0'. Override detected version \
with any version. This is helpful in order to check if journeys in one environment would be compatible running \
in another environment (e.g. in preparation of migrating from on-prem to ForgeRock Identity Cloud. Only impacts \
these actions: -d, -l.");
const versionOptionM = new Option("-o, --version <version>", "Override version. Notation: 'X.Y.Z' e.g. '7.1.0'. Override detected version \
with any version. This is helpful in order to check if journeys in one environment would be compatible running \
in another environment (e.g. in preparation of migrating from on-prem to ForgeRock Identity Cloud. Only impacts \
these actions: -d, -l.");
const nameOption = new Option("-N, --name <name>", "Config entity name to be exported or imported/updated. Examples are \
managed, sync, provisioner-xxxx, etc.");
const nameOptionM = new Option("-N, --name <name>", "Config entity name to be exported or imported/updated. Examples are \
managed, sync, provisioner-xxxx, etc.")
const managedNameOption = new Option("-N, --name <name>", "Managed object name to be operated on. Examples are \
user, role, alpha_user, alpha_role etc.");
const managedNameOptionM = new Option("-N, --name <name>", "Managed object name to be operated on. Examples are \
user, role, alpha_user, alpha_role etc.")
const dirOption = new Option("-D, --directory <directory>", "Directory for exporting all configuration entities to");
const dirOptionM = new Option("-D, --directory <directory>", "Directory for exporting all configuration entities to");
const entitiesFileOption = new Option("-E, --entitiesFile <file>", "JSON file that specifies the config entities to export/import.");
const entitiesFileOptionM = new Option("-E, --entitiesFile <file>", "JSON file that specifies the config entities to export/import.");
const envFileOption = new Option("-e, --envFile <file>", "File that defines environment specific variables for replacement during configuration export/import.");
const envFileOptionM = new Option("-e, --envFile <file>", "File that defines environment specific variables for replacement during configuration export/import.");

hostOptionM.makeOptionMandatory();
userOptionM.makeOptionMandatory();
passwordOptionM.makeOptionMandatory();
realmOptionM.makeOptionMandatory();
treeOptionM.makeOptionMandatory();
fileOptionM.makeOptionMandatory();
deploymentOptionM.makeOptionMandatory();
noReUUIDOptionM.makeOptionMandatory();
versionOptionM.makeOptionMandatory();
nameOptionM.makeOptionMandatory();
dirOptionM.makeOptionMandatory();
entitiesFileOptionM.makeOptionMandatory();
envFileOptionM.makeOptionMandatory();
managedNameOptionM.makeOptionMandatory();

module.exports = {
    hostOption,
    hostOptionM,
    userOption,
    userOptionM,
    passwordOption,
    passwordOptionM,
    realmOption,
    realmOptionM,
    treeOption,
    treeOptionM,
    fileOption,
    fileOptionM,
    deploymentOption,
    deploymentOptionM,
    noReUUIDOption,
    noReUUIDOptionM,
    versionOption,
    versionOptionM,
    nameOption,
    nameOptionM,
    dirOption,
    dirOptionM,
    entitiesFileOption,
    entitiesFileOptionM,
    envFileOption,
    envFileOptionM,
    managedNameOption,
    managedNameOptionM
}