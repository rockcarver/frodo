import { dedupeArr } from './dedupeArr';
/**
 * 
 * @param {import('../../types/utils/OOTBNodeTypes').ALL_AMSupportedVersions} amVersion
 * @returns {Array<string>|boolean}
*/
export const OOTBNodeTypes = (amVersion) => {
    const OOTB_NODE_TYPES_7 = [
        'AcceptTermsAndConditionsNode',
        'AccountActiveDecisionNode',
        'AccountLockoutNode',
        'AgentDataStoreDecisionNode',
        'AnonymousSessionUpgradeNode',
        'AnonymousUserNode',
        'AttributeCollectorNode',
        'AttributePresentDecisionNode',
        'AttributeValueDecisionNode',
        'AuthLevelDecisionNode',
        'ChoiceCollectorNode',
        'ConsentNode',
        'CookiePresenceDecisionNode',
        'CreateObjectNode',
        'CreatePasswordNode',
        'DataStoreDecisionNode',
        'DeviceGeoFencingNode',
        'DeviceLocationMatchNode',
        'DeviceMatchNode',
        'DeviceProfileCollectorNode',
        'DeviceSaveNode',
        'DeviceTamperingVerificationNode',
        'DisplayUserNameNode',
        'EmailSuspendNode',
        'EmailTemplateNode',
        'IdentifyExistingUserNode',
        'IncrementLoginCountNode',
        'InnerTreeEvaluatorNode',
        'IotAuthenticationNode',
        'IotRegistrationNode',
        'KbaCreateNode',
        'KbaDecisionNode',
        'KbaVerifyNode',
        'LdapDecisionNode',
        'LoginCountDecisionNode',
        'MessageNode',
        'MetadataNode',
        'MeterNode',
        'ModifyAuthLevelNode',
        'OneTimePasswordCollectorDecisionNode',
        'OneTimePasswordGeneratorNode',
        'OneTimePasswordSmsSenderNode',
        'OneTimePasswordSmtpSenderNode',
        'PageNode',
        'PasswordCollectorNode',
        'PatchObjectNode',
        'PersistentCookieDecisionNode',
        'PollingWaitNode',
        'ProfileCompletenessDecisionNode',
        'ProvisionDynamicAccountNode',
        'ProvisionIdmAccountNode',
        'PushAuthenticationSenderNode',
        'PushResultVerifierNode',
        'QueryFilterDecisionNode',
        'RecoveryCodeCollectorDecisionNode',
        'RecoveryCodeDisplayNode',
        'RegisterLogoutWebhookNode',
        'RemoveSessionPropertiesNode',
        'RequiredAttributesDecisionNode',
        'RetryLimitDecisionNode',
        'ScriptedDecisionNode',
        'SelectIdPNode',
        'SessionDataNode',
        'SetFailureUrlNode',
        'SetPersistentCookieNode',
        'SetSessionPropertiesNode',
        'SetSuccessUrlNode',
        'SocialFacebookNode',
        'SocialGoogleNode',
        'SocialNode',
        'SocialOAuthIgnoreProfileNode',
        'SocialOpenIdConnectNode',
        'SocialProviderHandlerNode',
        'TermsAndConditionsDecisionNode',
        'TimeSinceDecisionNode',
        'TimerStartNode',
        'TimerStopNode',
        'UsernameCollectorNode',
        'ValidatedPasswordNode',
        'ValidatedUsernameNode',
        'WebAuthnAuthenticationNode',
        'WebAuthnDeviceStorageNode',
        'WebAuthnRegistrationNode',
        'ZeroPageLoginNode',
        'product-CertificateCollectorNode',
        'product-CertificateUserExtractorNode',
        'product-CertificateValidationNode',
        'product-KerberosNode',
        'product-ReCaptchaNode',
        'product-Saml2Node',
        'product-WriteFederationInformationNode',
    ];

    const OOTB_NODE_TYPES_7_1 = dedupeArr([
        'PushRegistrationNode',
        'GetAuthenticatorAppNode',
        'MultiFactorRegistrationOptionsNode',
        'OptOutMultiFactorAuthenticationNode',
        ...OOTB_NODE_TYPES_7
    ]);

    const OOTB_NODE_TYPES_7_2 = dedupeArr([
        'OathRegistrationNode',
        'OathTokenVerifierNode',
        'PassthroughAuthenticationNode',
        'ConfigProviderNode',
        'DebugNode',
        ...OOTB_NODE_TYPES_7_1
    ]);

    const OOTB_NODE_TYPES_6_5 = [
        'AbstractSocialAuthLoginNode',
        'AccountLockoutNode',
        'AgentDataStoreDecisionNode',
        'AnonymousUserNode',
        'AuthLevelDecisionNode',
        'ChoiceCollectorNode',
        'CookiePresenceDecisionNode',
        'CreatePasswordNode',
        'DataStoreDecisionNode',
        'InnerTreeEvaluatorNode',
        'LdapDecisionNode',
        'MessageNode',
        'MetadataNode',
        'MeterNode',
        'ModifyAuthLevelNode',
        'OneTimePasswordCollectorDecisionNode',
        'OneTimePasswordGeneratorNode',
        'OneTimePasswordSmsSenderNode',
        'OneTimePasswordSmtpSenderNode',
        'PageNode',
        'PasswordCollectorNode',
        'PersistentCookieDecisionNode',
        'PollingWaitNode',
        'ProvisionDynamicAccountNode',
        'ProvisionIdmAccountNode',
        'PushAuthenticationSenderNode',
        'PushResultVerifierNode',
        'RecoveryCodeCollectorDecisionNode',
        'RecoveryCodeDisplayNode',
        'RegisterLogoutWebhookNode',
        'RemoveSessionPropertiesNode',
        'RetryLimitDecisionNode',
        'ScriptedDecisionNode',
        'SessionDataNode',
        'SetFailureUrlNode',
        'SetPersistentCookieNode',
        'SetSessionPropertiesNode',
        'SetSuccessUrlNode',
        'SocialFacebookNode',
        'SocialGoogleNode',
        'SocialNode',
        'SocialOAuthIgnoreProfileNode',
        'SocialOpenIdConnectNode',
        'TimerStartNode',
        'TimerStopNode',
        'UsernameCollectorNode',
        'WebAuthnAuthenticationNode',
        'WebAuthnRegistrationNode',
        'ZeroPageLoginNode',
    ];

    const OOTB_NODE_TYPES_6 = [
        'AbstractSocialAuthLoginNode',
        'AccountLockoutNode',
        'AgentDataStoreDecisionNode',
        'AnonymousUserNode',
        'AuthLevelDecisionNode',
        'ChoiceCollectorNode',
        'CookiePresenceDecisionNode',
        'CreatePasswordNode',
        'DataStoreDecisionNode',
        'InnerTreeEvaluatorNode',
        'LdapDecisionNode',
        'MessageNode',
        'MetadataNode',
        'MeterNode',
        'ModifyAuthLevelNode',
        'OneTimePasswordCollectorDecisionNode',
        'OneTimePasswordGeneratorNode',
        'OneTimePasswordSmsSenderNode',
        'OneTimePasswordSmtpSenderNode',
        'PageNode',
        'PasswordCollectorNode',
        'PersistentCookieDecisionNode',
        'PollingWaitNode',
        'ProvisionDynamicAccountNode',
        'ProvisionIdmAccountNode',
        'PushAuthenticationSenderNode',
        'PushResultVerifierNode',
        'RecoveryCodeCollectorDecisionNode',
        'RecoveryCodeDisplayNode',
        'RegisterLogoutWebhookNode',
        'RemoveSessionPropertiesNode',
        'RetryLimitDecisionNode',
        'ScriptedDecisionNode',
        'SessionDataNode',
        'SetFailureUrlNode',
        'SetPersistentCookieNode',
        'SetSessionPropertiesNode',
        'SetSuccessUrlNode',
        'SocialFacebookNode',
        'SocialGoogleNode',
        'SocialNode',
        'SocialOAuthIgnoreProfileNode',
        'SocialOpenIdConnectNode',
        'TimerStartNode',
        'TimerStopNode',
        'UsernameCollectorNode',
        'WebAuthnAuthenticationNode',
        'WebAuthnRegistrationNode',
        'ZeroPageLoginNode',
    ];

    switch (amVersion) {
        case '7.1.0':
            return OOTB_NODE_TYPES_7_1.slice(0);
        case '7.2.0':
            return OOTB_NODE_TYPES_7_2.slice(0);
        case '7.0.0':
        case '7.0.1':
        case '7.0.2':
            return OOTB_NODE_TYPES_7.slice(0);
        case '6.5.3':
        case '6.5.2.3':
        case '6.5.2.2':
        case '6.5.2.1':
        case '6.5.2':
        case '6.5.1':
        case '6.5.0.2':
        case '6.5.0.1':
            return OOTB_NODE_TYPES_6_5.slice(0);
        case '6.0.0.7':
        case '6.0.0.6':
        case '6.0.0.5':
        case '6.0.0.4':
        case '6.0.0.3':
        case '6.0.0.2':
        case '6.0.0.1':
        case '6.0.0':
            return OOTB_NODE_TYPES_6.slice(0);
        default:
            return true;
    }
}