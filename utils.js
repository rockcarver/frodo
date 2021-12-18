const util = require('util');
const url = require('url');
// var _ = require('underscore');

const realmPathTemplate = "/realms/%s"
const amApiVersion = "resource=1.0"

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function ApplyRenamingPolicy(name) {
    const capturingRegex = /(.* - imported) \(([0-9]+)\)/;
    const found = name.match(capturingRegex);
    if(found) {
        // already renamed one or more times
        // console.log(found);
        if(found.length > 0 && found.length == 3) {
            // return the next number
            return found[1] + " (" + (parseInt(found[2])+1) + ")";
        }
    } else {
        // first time
        return name + " - imported (1)";
    }
}

function GetRealmUrl(realm) {
	if(realm.startsWith("/") && realm.length > 1) {
		realm = realm.substring(1);
	}
	let realmPath = util.format(realmPathTemplate, "root")
	if(realm != "/") {
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
module.exports.amApiVersion = amApiVersion;
module.exports.ootbnodetypes_6 = ootbnodetypes_6;
module.exports.ootbnodetypes_6_5 = ootbnodetypes_6_5;
module.exports.ootbnodetypes_7 = ootbnodetypes_7;
module.exports.ootbnodetypes_7_1 = ootbnodetypes_7_1;
module.exports.ootbnodetypes_7_2 = ootbnodetypes_7_2;