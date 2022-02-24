import { Argument, Option } from 'commander';
import * as global from '../storage/StaticStorage.js';

const hostArgumentDescription = "Access Management base URL, e.g.: https://cdk.iam.example.com/am. To use a connection profile, just specify a unique substring."
export const hostArgument = new Argument("[host]", hostArgumentDescription);
export const hostArgumentM = new Argument("<host>", hostArgumentDescription);

const realmArgumentDescription = "Realm. Specify realm as '/' for the root realm or 'realm' or '/parent/child' otherwise."
export const realmArgument = new Argument("[realm]", realmArgumentDescription).default(global.DEFAULT_REALM_KEY);
export const realmArgumentM = new Argument("<realm>", realmArgumentDescription);

const userArgumentDescription = "Username to login with. Must be an admin user with appropriate rights to manage authentication journeys/trees.";
export const userArgument = new Argument("[user]", userArgumentDescription);
export const userArgumentM = new Argument("<user>", userArgumentDescription);

const passwordArgumentDescription = "Password."
export const passwordArgument = new Argument("[password]", passwordArgumentDescription);
export const passwordArgumentM = new Argument("<password>", passwordArgumentDescription);

const apiKeyArgumentDescription = "API key for logging API.";
export const apiKeyArgument = new Argument("[key]", apiKeyArgumentDescription);

const apiSecretArgumentDescription = "API secret for logging API.";
export const apiSecretArgument = new Argument("[secret]", apiSecretArgumentDescription);

const treeOptionDescription = "Specify the name of an authentication journey/tree.";
export const treeOption = new Option("-t, --tree <tree>", treeOptionDescription);
export const treeOptionM = new Option("-t, --tree <tree>", treeOptionDescription);

const fileOptionDescription = "File name.";
export const fileOption = new Option("-f, --file <file>", fileOptionDescription);
export const fileOptionM = new Option("-f, --file <file>", fileOptionDescription);

const deploymentOptionDescription = "Override auto-detected deployment type. Valid values for type: \n\
classic:  A classic Access Management-only deployment with custom layout and configuration. \n\
cloud:    A ForgeRock Identity Cloud environment. \n\
forgeops: A ForgeOps CDK or CDM deployment. \n\
The detected or provided deployment type controls certain behavior like obtaining an Identity \
Management admin token or not and whether to export/import referenced email templates or how \
to walk through the tenant admin login flow of Identity Cloud and handle MFA";
export const deploymentOption = new Option("-m, --type <type>", deploymentOptionDescription).choices(global.DEPLOYMENT_TYPES);
export const deploymentOptionM = new Option("-m, --type <type>", deploymentOptionDescription).choices(global.DEPLOYMENT_TYPES);


export const insecureOption = new Option("-k, --insecure", "Allow insecure connections when using SSL/TLS").default(false, "Don't allow insecure connections");


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

const dirOptionDescription = "Directory for exporting all configuration entities to.";
export const dirOption = new Option("-D, --directory <directory>", dirOptionDescription);
export const dirOptionM = new Option("-D, --directory <directory>", dirOptionDescription);

const entitiesFileOptionDescription = "JSON file that specifies the config entities to export/import.";
export const entitiesFileOption = new Option("-E, --entitiesFile <file>", entitiesFileOptionDescription);
export const entitiesFileOptionM = new Option("-E, --entitiesFile <file>", entitiesFileOptionDescription);

const envFileOptionDescription = "File that defines environment specific variables for replacement during configuration export/import.";
export const envFileOption = new Option("-e, --envFile <file>", envFileOptionDescription);
export const envFileOptionM = new Option("-e, --envFile <file>", envFileOptionDescription);

const sourcesOptionDescription = "Comma separated list of log sources";
const sourcesOptionDefaultValueDescription = "Log everything";
export const sourcesOptionM = new Option("-c, --sources <sources>", sourcesOptionDescription).default("am-everything,idm-everything", sourcesOptionDefaultValueDescription);

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
sourcesOptionM.makeOptionMandatory();