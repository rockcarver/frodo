import { Option } from 'commander';

export const hostOption = new Option("-h, --host <host>", "Access Management host URL, e.g.: https://login.example.com/openam. \
If using a saved connection, just specifying the host or even a unique substring of host is sufficient (no credential \
parameters needed.");
export const hostOptionM = new Option("-h, --host <host>", "Access Management host URL, e.g.: https://login.example.com/openam. \
If using a saved connection, just specifying the host or even a unique substring of host is sufficient (no credential \
parameters needed.");
export const userOption = new Option("-u, --user <user>", "Username to login with. Must be an admin user \
with appropriate rights to manage authentication trees");
export const userOptionM = new Option("-u, --user <user>", "Username to login with. Must be an admin user \
with appropriate rights to manage authentication trees");
export const passwordOption = new Option("-p, --password <password>", "Password");
export const passwordOptionM = new Option("-p, --password <password>", "Password")
export const realmOption = new Option("-r, --realm <realm>", "Realm. If not specified, the root realm '/' is assumed. \
Specify realm as '/parent/child'. If using 'amadmin' as the user, login \
will happen against the root realm but subsequent operations will be \
performed in the realm specified. For all other users, login and subsequent \
operations will occur against the realm specified");
export const realmOptionM = new Option("-r, --realm <realm>", "Realm. If not specified, the root realm '/' is assumed. \
Specify realm as '/parent/child'. If using 'amadmin' as the user, login \
will happen against the root realm but subsequent operations will be \
performed in the realm specified. For all other users, login and subsequent \
operations will occur against the realm specified");
export const treeOption = new Option("-t, --tree <tree>", "Specify the name of an authentication tree. Mandatory in \
combination with the following actions: -i, -e, -d");
export const treeOptionM = new Option("-t, --tree <tree>", "Specify the name of an authentication tree. Mandatory in \
combination with the following actions: -i, -e, -d");
export const fileOption = new Option("-f, --file <file>", "If supplied, export/list to and import from <file> instead \
of stdout and stdin. For -S, use as file prefix");
export const fileOptionM = new Option("-f, --file <file>", "If supplied, export/list to and import from <file> instead \
of stdout and stdin. For -S, use as file prefix");
export const deploymentOption = new Option("-m, --type <type>", "Override auto-detected deployment type. Valid values for type: \
[Classic] - A classic Access Management-only deployment with custom layout and configuration. \
[Cloud] - A ForgeRock Identity Cloud environment. \
[ForgeOps] - A ForgeOps CDK or CDM deployment. \
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and handle MFA").choices(['Classic', 'Cloud', 'ForgeOps']);
export const deploymentOptionM = new Option("-m, --type <type>", "Override auto-detected deployment type. Valid values for type: \
[Classic] - A classic Access Management-only deployment with custom layout and configuration. \
[Cloud] - A ForgeRock Identity Cloud environment. \
[ForgeOps] - A ForgeOps CDK or CDM deployment. \
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and handle MFA").choices(['Classic', 'Cloud', 'ForgeOps']);
export const noReUUIDOption = new Option("-n", "No Re-UUID, i.e., import does not generate new UUIDs \
for (inner)nodes. Used to update existing trees/nodes instead of cloning them.");
export const noReUUIDOptionM = new Option("-n", "No Re-UUID, i.e., import does not generate new UUIDs \
for (inner)nodes. Used to update existing trees/nodes instead of cloning them.");
export const versionOption =  new Option("-o, --version <version>", "Override version. Notation: 'X.Y.Z' e.g. '7.1.0'. Override detected version \
with any version. This is helpful in order to check if journeys in one environment would be compatible running \
in another environment (e.g. in preparation of migrating from on-prem to ForgeRock Identity Cloud. Only impacts \
these actions: -d, -l.");
export const versionOptionM = new Option("-o, --version <version>", "Override version. Notation: 'X.Y.Z' e.g. '7.1.0'. Override detected version \
with any version. This is helpful in order to check if journeys in one environment would be compatible running \
in another environment (e.g. in preparation of migrating from on-prem to ForgeRock Identity Cloud. Only impacts \
these actions: -d, -l.");
export const nameOption = new Option("-N, --name <name>", "Config entity name to be exported or imported/updated. Examples are \
managed, sync, provisioner-xxxx, etc.");
export const nameOptionM = new Option("-N, --name <name>", "Config entity name to be exported or imported/updated. Examples are \
managed, sync, provisioner-xxxx, etc.")
export const managedNameOption = new Option("-N, --name <name>", "Managed object name to be operated on. Examples are \
user, role, alpha_user, alpha_role etc.");
export const managedNameOptionM = new Option("-N, --name <name>", "Managed object name to be operated on. Examples are \
user, role, alpha_user, alpha_role etc.")
export const dirOption = new Option("-D, --directory <directory>", "Directory for exporting all configuration entities to");
export const dirOptionM = new Option("-D, --directory <directory>", "Directory for exporting all configuration entities to");
export const entitiesFileOption = new Option("-E, --entitiesFile <file>", "JSON file that specifies the config entities to export/import.");
export const entitiesFileOptionM = new Option("-E, --entitiesFile <file>", "JSON file that specifies the config entities to export/import.");
export const envFileOption = new Option("-e, --envFile <file>", "File that defines environment specific variables for replacement during configuration export/import.");
export const envFileOptionM = new Option("-e, --envFile <file>", "File that defines environment specific variables for replacement during configuration export/import.");
export const apiKeyOption = new Option("-k, --key <key>", "API key for logging API (ForgeRock ID Cloud only)");
export const apiKeyOptionM = new Option("-k, --key <key>", "API key for logging API (ForgeRock ID Cloud only)");
export const apiSecretOption = new Option("-s, --secret <secret>", "API secret for logging API (ForgeRock ID Cloud only)");
export const apiSecretOptionM = new Option("-s, --secret <secret>", "API secret for logging API (ForgeRock ID Cloud only)");
export const sourcesOption = new Option("-c, --sources <sources>", "Comma separated list of log sources");

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
apiKeyOptionM.makeOptionMandatory();
apiSecretOptionM.makeOptionMandatory();
sourcesOption.makeOptionMandatory();