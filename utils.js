const util = require('util');
const url = require('url');
const os = require('os');
const { UV_FS_O_FILEMAP } = require('constants');
// var _ = require('underscore');

const realmPathTemplate = "/realms/%s"
const amApiVersion = "resource=1.0"

const connFile = {
    "name": "./connections.json",
    "options": 'utf8',
    "indentation": 4
};

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function GetConnectionFileName() {
    return (require('os').homedir() + "/.frodorc");
    // if(os.platform() == "win32") {
    //     return "%userprofile%/.frodorc"
    // } else {
    //     return "$HOME/.frodorc"
    // }
}

function InitConnections() {
    // create connections.json file if it doesn't exist
    const filename = GetConnectionFileName();
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, JSON.stringify({}, null, connFile.indentation));
    }
    // convert clear text password to base64-encoded
    else {
        const data = fs.readFileSync(filename, connFile.options);
        var connectionsData = JSON.parse(data);
        var convert = false;
        Object.keys(connectionsData).forEach(conn => {
            if (connectionsData[conn].password) {
                convert = true;
                connectionsData[conn].encodedPassword = Buffer.from(connectionsData[conn].password).toString('base64');
                delete connectionsData[conn].password;
            }
        });
        if (convert) {
            fs.writeFileSync(filename, JSON.stringify(connectionsData, null, connFile.indentation));
        }
    }
}

async function SaveConnection(frToken) {
    const filename = GetConnectionFileName();
    console.log(`Saving creds in ${filename}...`);
    // const data = fs.readFileSync(filename, connFile.options);
    let connectionsData = {};
    let existingData = {};
    try {
        const fstat = fs.statSync(filename);
        const data = fs.readFileSync(filename, "utf8");
        connectionsData = JSON.parse(data);
        if (connectionsData[frToken.tenant]) {
            existingData = connectionsData[frToken.tenant];
            console.log(`Updating existing connection profile ${frToken.tenant}`);
        } else
            console.log(`Adding connection profile ${frToken.tenant}`);
    } catch (e) {
        console.log(`Creating connection profile file ${filename} with ${frToken.tenant}`);
    }
    if (frToken.username) existingData.username = frToken.username;
    if (frToken.password) existingData.encodedPassword = Buffer.from(frToken.password).toString('base64');
    if (frToken.key) existingData.logApiKey = frToken.key;
    if (frToken.key) existingData.logApiSecret = frToken.secret;
    connectionsData[frToken.tenant] = existingData;

    fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
    console.log("done.");
}

function ListConnections() {
    try {
        const filename = GetConnectionFileName();
        const data = fs.readFileSync(filename, "utf8");
        const connectionsData = JSON.parse(data);
        console.log(`[Host] : [Username]`);
        for (c in connectionsData) {
            console.log(`- [${c}] : [${connectionsData[c].username}]${connectionsData[c].logApiKey?" [Log API key present]":""}`);
        }
        console.log("Any unique substring of a saved host can be used as the value for host parameter in all commands");
    } catch (e) {
        console.error(`No connections found in ${filename}`);
    }
}

function FindByWildcard(data, tenant) {
    for(const savedTenant in data) {
        if(savedTenant.includes(tenant)) {
            let ret = data[savedTenant];
            ret.tenant = savedTenant;
            return ret;
        }
    }
    return null;
}

function GetConnection(tenant) {
    try {
        const filename = GetConnectionFileName();
        const data = fs.readFileSync(filename, connFile.options);
        const connectionsData = JSON.parse(data);
        // if (!connectionsData[tenant]) {
        const tenantData = FindByWildcard(connectionsData, tenant);
        if(!tenantData) {
            console.error(`No saved credentials for tenant ${tenant}. Please specify credentials on command line`);
            return null;
        }
        return {
            tenant: tenantData.tenant,
            username: tenantData.username?tenantData.username:null,
            password: tenantData.encodedPassword?Buffer.from(tenantData.encodedPassword, 'base64').toString(connFile.options):null,
            key: tenantData.logApiKey?tenantData.logApiKey:null,
            secret: tenantData.logApiSecret?tenantData.logApiSecret:null
        }    
    } catch(e) {
        console.error("Can not read saved connection info, please specify credentials on command line")
        return null;
    }
}


function ApplyRenamingPolicy(name) {
    const capturingRegex = /(.* - imported) \(([0-9]+)\)/;
    const found = name.match(capturingRegex);
    if (found) {
        // already renamed one or more times
        // console.log(found);
        if (found.length > 0 && found.length == 3) {
            // return the next number
            return found[1] + " (" + (parseInt(found[2]) + 1) + ")";
        }
    } else {
        // first time
        return name + " - imported (1)";
    }
}

function GetRealmUrl(realm) {
    if (realm.startsWith("/") && realm.length > 1) {
        realm = realm.substring(1);
    }
    let realmPath = util.format(realmPathTemplate, "root")
    if (realm != "/") {
        realmPath = realmPath + util.format(realmPathTemplate, realm)
    }
    return realmPath
}

function GetTenantURL(tenant) {
    const parsedUrl = url.parse(tenant);
    // console.log(parsedUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

// function FindEnvKey(key, data, envData) {
//     if(_.property(key.split("."))(data) != "undefined") {
//         const valueFromConfig = _.property(key.split("."))(data);
//         _.property(key.split("."))(data) = envData[key];
//         // update envData with actual value from exported config
//         _.property(key.split("."))(envData) = valueFromConfig;
//     }
// }

var ootbnodetypes_7 = [
    "AcceptTermsAndConditionsNode",
    "AccountActiveDecisionNode",
    "AccountLockoutNode",
    "AgentDataStoreDecisionNode",
    "AnonymousSessionUpgradeNode",
    "AnonymousUserNode",
    "AttributeCollectorNode",
    "AttributePresentDecisionNode",
    "AttributeValueDecisionNode",
    "AuthLevelDecisionNode",
    "ChoiceCollectorNode",
    "ConsentNode",
    "CookiePresenceDecisionNode",
    "CreateObjectNode",
    "CreatePasswordNode",
    "DataStoreDecisionNode",
    "DeviceGeoFencingNode",
    "DeviceLocationMatchNode",
    "DeviceMatchNode",
    "DeviceProfileCollectorNode",
    "DeviceSaveNode",
    "DeviceTamperingVerificationNode",
    "DisplayUserNameNode",
    "EmailSuspendNode",
    "EmailTemplateNode",
    "IdentifyExistingUserNode",
    "IncrementLoginCountNode",
    "InnerTreeEvaluatorNode",
    "IotAuthenticationNode",
    "IotRegistrationNode",
    "KbaCreateNode",
    "KbaDecisionNode",
    "KbaVerifyNode",
    "LdapDecisionNode",
    "LoginCountDecisionNode",
    "MessageNode",
    "MetadataNode",
    "MeterNode",
    "ModifyAuthLevelNode",
    "OneTimePasswordCollectorDecisionNode",
    "OneTimePasswordGeneratorNode",
    "OneTimePasswordSmsSenderNode",
    "OneTimePasswordSmtpSenderNode",
    "PageNode",
    "PasswordCollectorNode",
    "PatchObjectNode",
    "PersistentCookieDecisionNode",
    "PollingWaitNode",
    "ProfileCompletenessDecisionNode",
    "ProvisionDynamicAccountNode",
    "ProvisionIdmAccountNode",
    "PushAuthenticationSenderNode",
    "PushResultVerifierNode",
    "QueryFilterDecisionNode",
    "RecoveryCodeCollectorDecisionNode",
    "RecoveryCodeDisplayNode",
    "RegisterLogoutWebhookNode",
    "RemoveSessionPropertiesNode",
    "RequiredAttributesDecisionNode",
    "RetryLimitDecisionNode",
    "ScriptedDecisionNode",
    "SelectIdPNode",
    "SessionDataNode",
    "SetFailureUrlNode",
    "SetPersistentCookieNode",
    "SetSessionPropertiesNode",
    "SetSuccessUrlNode",
    "SocialFacebookNode",
    "SocialGoogleNode",
    "SocialNode",
    "SocialOAuthIgnoreProfileNode",
    "SocialOpenIdConnectNode",
    "SocialProviderHandlerNode",
    "TermsAndConditionsDecisionNode",
    "TimeSinceDecisionNode",
    "TimerStartNode",
    "TimerStopNode",
    "UsernameCollectorNode",
    "ValidatedPasswordNode",
    "ValidatedUsernameNode",
    "WebAuthnAuthenticationNode",
    "WebAuthnDeviceStorageNode",
    "WebAuthnRegistrationNode",
    "ZeroPageLoginNode",
    "product-CertificateCollectorNode",
    "product-CertificateUserExtractorNode",
    "product-CertificateValidationNode",
    "product-KerberosNode",
    "product-ReCaptchaNode",
    "product-Saml2Node",
    "product-WriteFederationInformationNode"
];

var ootbnodetypes_7_1 = [
	"PushRegistrationNode",
	"GetAuthenticatorAppNode",
	"MultiFactorRegistrationOptionsNode",
	"OptOutMultiFactorAuthenticationNode"
].concat(ootbnodetypes_7);

var ootbnodetypes_7_2 = [
	"OathRegistrationNode",
	"OathTokenVerifierNode",
	"PassthroughAuthenticationNode",
	"ConfigProviderNode"
].concat(ootbnodetypes_7_1);

var ootbnodetypes_6_5 = [
    "AbstractSocialAuthLoginNode",
    "AccountLockoutNode",
    "AgentDataStoreDecisionNode",
    "AnonymousUserNode",
    "AuthLevelDecisionNode",
    "ChoiceCollectorNode",
    "CookiePresenceDecisionNode",
    "CreatePasswordNode",
    "DataStoreDecisionNode",
    "InnerTreeEvaluatorNode",
    "LdapDecisionNode",
    "MessageNode",
    "MetadataNode",
    "MeterNode",
    "ModifyAuthLevelNode",
    "OneTimePasswordCollectorDecisionNode",
    "OneTimePasswordGeneratorNode",
    "OneTimePasswordSmsSenderNode",
    "OneTimePasswordSmtpSenderNode",
    "PageNode",
    "PasswordCollectorNode",
    "PersistentCookieDecisionNode",
    "PollingWaitNode",
    "ProvisionDynamicAccountNode",
    "ProvisionIdmAccountNode",
    "PushAuthenticationSenderNode",
    "PushResultVerifierNode",
    "RecoveryCodeCollectorDecisionNode",
    "RecoveryCodeDisplayNode",
    "RegisterLogoutWebhookNode",
    "RemoveSessionPropertiesNode",
    "RetryLimitDecisionNode",
    "ScriptedDecisionNode",
    "SessionDataNode",
    "SetFailureUrlNode",
    "SetPersistentCookieNode",
    "SetSessionPropertiesNode",
    "SetSuccessUrlNode",
    "SocialFacebookNode",
    "SocialGoogleNode",
    "SocialNode",
    "SocialOAuthIgnoreProfileNode",
    "SocialOpenIdConnectNode",
    "TimerStartNode",
    "TimerStopNode",
    "UsernameCollectorNode",
    "WebAuthnAuthenticationNode",
    "WebAuthnRegistrationNode",
    "ZeroPageLoginNode"
];

var ootbnodetypes_6 = [
    "AbstractSocialAuthLoginNode",
    "AccountLockoutNode",
    "AgentDataStoreDecisionNode",
    "AnonymousUserNode",
    "AuthLevelDecisionNode",
    "ChoiceCollectorNode",
    "CookiePresenceDecisionNode",
    "CreatePasswordNode",
    "DataStoreDecisionNode",
    "InnerTreeEvaluatorNode",
    "LdapDecisionNode",
    "MessageNode",
    "MetadataNode",
    "MeterNode",
    "ModifyAuthLevelNode",
    "OneTimePasswordCollectorDecisionNode",
    "OneTimePasswordGeneratorNode",
    "OneTimePasswordSmsSenderNode",
    "OneTimePasswordSmtpSenderNode",
    "PageNode",
    "PasswordCollectorNode",
    "PersistentCookieDecisionNode",
    "PollingWaitNode",
    "ProvisionDynamicAccountNode",
    "ProvisionIdmAccountNode",
    "PushAuthenticationSenderNode",
    "PushResultVerifierNode",
    "RecoveryCodeCollectorDecisionNode",
    "RecoveryCodeDisplayNode",
    "RegisterLogoutWebhookNode",
    "RemoveSessionPropertiesNode",
    "RetryLimitDecisionNode",
    "ScriptedDecisionNode",
    "SessionDataNode",
    "SetFailureUrlNode",
    "SetPersistentCookieNode",
    "SetSessionPropertiesNode",
    "SetSuccessUrlNode",
    "SocialFacebookNode",
    "SocialGoogleNode",
    "SocialNode",
    "SocialOAuthIgnoreProfileNode",
    "SocialOpenIdConnectNode",
    "TimerStartNode",
    "TimerStopNode",
    "UsernameCollectorNode",
    "WebAuthnAuthenticationNode",
    "WebAuthnRegistrationNode",
    "ZeroPageLoginNode"
];

module.exports.replaceAll = replaceAll;
module.exports.GetRealmUrl = GetRealmUrl;
module.exports.GetTenantURL = GetTenantURL;
module.exports.ApplyRenamingPolicy = ApplyRenamingPolicy;
module.exports.InitConnections = InitConnections;
module.exports.SaveConnection = SaveConnection;
module.exports.GetConnection = GetConnection;
module.exports.ListConnections = ListConnections;
module.exports.GetConnectionFileName = GetConnectionFileName;

module.exports.amApiVersion = amApiVersion;
module.exports.ootbnodetypes_6 = ootbnodetypes_6;
module.exports.ootbnodetypes_6_5 = ootbnodetypes_6_5;
module.exports.ootbnodetypes_7 = ootbnodetypes_7;
module.exports.ootbnodetypes_7_1 = ootbnodetypes_7_1;
module.exports.ootbnodetypes_7_2 = ootbnodetypes_7_2;