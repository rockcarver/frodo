import { generateAmApi } from './BaseApi.js';
import { getCurrentRealmPath, replaceAll } from './utils/ApiUtils.js';
import crypto from 'crypto';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import storage from '../storage/SessionStorage.js';
import { getEmailTemplate, putEmailTemplate } from './EmailTemplateApi.js';
import { getScript, putScript } from './ScriptApi.js';

const journeyURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/trees/%s"
const nodeURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/nodes/%s/%s"
const queryAllTreesURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/trees?_queryFilter=true"
const queryAllNodesURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/nodes?_action=nextdescendents"

const apiVersion = 'protocol=2.1,resource=1.0';
const getTreeApiConfig = () => {
    const configPath = getCurrentRealmPath();
    return {
        path: `${configPath}/authentication/authenticationtrees`,
        apiVersion,
    };
};

const containerNodes = [
    "PageNode",
    "CustomPageNode"
];

const scriptedNodes = [
    "ConfigProviderNode",
    "ScriptedDecisionNode",
    "ClientScriptNode",
    "SocialProviderHandlerNode",
    "CustomScriptNode"
];

const emailTemplateNodes = [
    "EmailSuspendNode",
    "EmailTemplateNode"
];

function getOrigin(tenant, realm) {
    return crypto.createHash('md5').update(`${tenant}${realm}`).digest("hex");
}

async function isCustom(journey) {
    let ootbNodeTypes = [];
    const nodeList = journey["nodes"]
    // console.log(nodeList);
    // console.log(storage.session.getAmVersion());
    switch (storage.session.getAmVersion()) {
        case "7.1.0":
            ootbNodeTypes = OOTB_NODE_TYPES_7_1.slice(0);
            break;
        case "7.2.0":
            // console.log("here");
            ootbNodeTypes = OOTB_NODE_TYPES_7_2.slice(0);
            break;
        case "7.0.0":
        case "7.0.1":
        case "7.0.2":
            ootbNodeTypes = OOTB_NODE_TYPES_7.slice(0);
            break;
        case "6.5.3":
        case "6.5.2.3":
        case "6.5.2.2":
        case "6.5.2.1":
        case "6.5.2":
        case "6.5.1":
        case "6.5.0.2":
        case "6.5.0.1":
            ootbNodeTypes = OOTB_NODE_TYPES_6_5.slice(0);
            break;
        case "6.0.0.7":
        case "6.0.0.6":
        case "6.0.0.5":
        case "6.0.0.4":
        case "6.0.0.3":
        case "6.0.0.2":
        case "6.0.0.1":
        case "6.0.0":
            ootbNodeTypes = OOTB_NODE_TYPES_6.slice(0);
            break;
        default:
            return true;
    }
    for (const node in nodeList) {
        if (!ootbNodeTypes.includes(nodeList[node].nodeType)) {
            return true;
        }
        if (containerNodes.includes(nodeList[node].nodeType)) {
            // console.log(nodeList[node])
            pageNode = await getNodeData(node, nodeList[node].nodeType)
            if (pageNode != null) {
                for (const pnode of pageNode.nodes) {
                    if (!ootbNodeTypes.includes(pnode.nodeType)) {
                        return true;
                    }
                }
            } else {
                console.error(`isCustom ERROR: can't get ${nodeList[node].nodeType} with id ${node} in ${journey._id}`);
                return false;
            }
        }
    }
    return false;
}

async function getAllJourneyData() {
    try {
        const urlString = util.format(queryAllTreesURLTemplate, storage.session.getTenant(), getCurrentRealmPath())
        const response = await generateAmApi(getTreeApiConfig()).get(
            urlString,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getAllJourneyData ERROR: get all journeys call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        if ("result" in response.data) {
            return response.data.result;
        }
        // console.log(journeyList);
        return null;
    } catch (e) {
        console.error("getAllJourneyData ERROR: error getting all journey data - ", e.message);
        return null;
    }
}

async function getAllNodesData() {
    try {
        const urlString = util.format(queryAllNodesURLTemplate, storage.session.getTenant(), getCurrentRealmPath())
        const response = await generateAmApi(getTreeApiConfig()).post(
            urlString,
            {},
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getAllNodesData ERROR: get all nodes call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        if ("result" in response.data) {
            return response.data.result;
        }
        return null;
    } catch (e) {
        console.error("getAllNodesData ERROR: error getting all nodes data - ", e.message);
        return null;
    }
}

export async function listJourneys(analyze) {
    try {
        const urlString = util.format(queryAllTreesURLTemplate, storage.session.getTenant(), getCurrentRealmPath())
        const response = await generateAmApi(getTreeApiConfig()).get(
            urlString,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("listJourneys ERROR: list journeys call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        let journeyList = [];
        if ("result" in response.data) {
            const journeys = response.data.result;
            for (const journey of journeys) {
                let customTree = false;
                if (analyze) {
                    customTree = await isCustom(journey);
                }
                journeyList.push({ name: journey._id, custom: customTree });
            }
        }
        // console.log(journeyList);
        return journeyList;
    } catch (e) {
        console.error("listJourneys ERROR: error getting journey list - ", e.message);
        return null;
    }
}

async function getNodeData(id, nodeType) {
    try {
        const urlString = util.format(nodeURLTemplate, storage.session.getTenant(), getCurrentRealmPath(storage.session.getRealm()), nodeType, id);
        const response = await generateAmApi(getTreeApiConfig()).get(
            urlString,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("getNodeData ERROR: get node call returned %d, possible cause: node not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("getNodeData ERROR: error getting node - ", e.message);
        return null;
    }
}

async function deleteNode(id, nodeType) {
    try {
        const urlString = util.format(nodeURLTemplate, storage.session.getTenant(), getCurrentRealmPath(), nodeType, id);
        const response = await generateAmApi(getTreeApiConfig()).delete(
            urlString,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("deleteNode ERROR: delete node call returned %d, possible cause: node not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("deleteNode ERROR: error deleting node - ", e.message);
        return null;
    }
}

async function getJourneyStructureData(name) {
    try {
        const urlString = util.format(journeyURLTemplate, storage.session.getTenant(), getCurrentRealmPath(), name);
        const response = await generateAmApi(getTreeApiConfig()).get(
            urlString,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error("\ngetJourneyStructureData ERROR: get journey structure call returned %d, possible cause: journey not found", response.status);
            return null;
        }
        return response.data;
    } catch (e) {
        console.error("\ngetJourneyStructureData ERROR: get journey structure error - ", e.message);
        return null;
    }
}

export async function getJourneyData(journey) {
    process.stdout.write(`${journey}`);

    const journeyMap = {};
    const nodesMap = {};
    const scriptsMap = {};
    const emailTemplatesMap = {};
    const inPageNodesMap = {};

    journeyMap["origin"] = getOrigin(storage.session.getTenant(), storage.session.getRealm());

    // read tree object
    const journeyStructureData = await getJourneyStructureData(journey);
    // console.log(journeyStructureData);
    if (journeyStructureData != null) {
        // exports = {"origin":"$ORIGIN", "innernodes":{}, "nodes":{}, "scripts":{}, "emailTemplates":{}}
        delete journeyStructureData["_rev"];

        // iterate over every node in tree
        for (const [nodeId, nodeInfo] of Object.entries(journeyStructureData["nodes"])) {
            // console.log(nodeInfo["nodeType"]);
            const nodeData = await getNodeData(nodeId, nodeInfo["nodeType"]);
            delete nodeData["_rev"];
            nodesMap[nodeId] = nodeData;
            process.stdout.write(".");

            // console.log(nodeData);

            if (scriptedNodes.includes(nodeInfo.nodeType)) {
                scriptsMap[nodeData.script] = await getScript(nodeData.script);
                process.stdout.write(".");
            }

            if (storage.session.getDeploymentType() == "Cloud" || storage.session.getDeploymentType() == "ForgeOps") {
                if (emailTemplateNodes.includes(nodeInfo.nodeType)) {
                    emailTemplatesMap[nodeData.emailTemplateName] = await getEmailTemplate(nodeData.emailTemplateName);
                    process.stdout.write(".");
                }
            }

            if (containerNodes.includes(nodeInfo.nodeType)) {
                for (const inPageNode of nodeData["nodes"]) {
                    const inPageNodeData = await getNodeData(inPageNode._id, inPageNode.nodeType);
                    delete inPageNodeData["_rev"];
                    inPageNodesMap[inPageNode._id] = inPageNodeData;

                    if (scriptedNodes.includes(inPageNode.nodeType)) {
                        scriptsMap[inPageNodeData.script] = await getScript(inPageNodeData.script);
                        process.stdout.write(".");
                    }

                    if (storage.session.getDeploymentType() == "Cloud" || storage.session.getDeploymentType() == "ForgeOps") {
                        if (emailTemplateNodes.includes(inPageNode.nodeType)) {
                            emailTemplatesMap[inPageNodeData.emailTemplateName] = await getEmailTemplate(inPageNodeData.emailTemplateName);
                            process.stdout.write(".");
                        }
                    }
                }
            }
        }
    }
    journeyMap["innernodes"] = inPageNodesMap;
    journeyMap["scripts"] = scriptsMap;
    journeyMap["emailTemplates"] = emailTemplatesMap;
    journeyMap["nodes"] = nodesMap;
    journeyMap["tree"] = journeyStructureData
    console.log(".");
    return journeyMap;
}

export function describeTree(journeyData) {
    const treeMap = {};
    const nodeTypeMap = {};
    const scriptsMap = {};
    const emailTemplatesMap = {};
    treeMap.treeName = journeyData.tree._id;
    for (const [nodeId, nodeData] of Object.entries(journeyData["nodes"])) {
        if (nodeTypeMap[nodeData._type._id]) {
            nodeTypeMap[nodeData._type._id] += 1;
        } else {
            nodeTypeMap[nodeData._type._id] = 1;
        }
    }

    for (const [nodeId, nodeData] of Object.entries(journeyData["innernodes"])) {
        if (nodeTypeMap[nodeData._type._id]) {
            nodeTypeMap[nodeData._type._id] += 1;
        } else {
            nodeTypeMap[nodeData._type._id] = 1;
        }
    }

    for (const [scriptId, scriptData] of Object.entries(journeyData["scripts"])) {
        scriptsMap[scriptData.name] = scriptData.description;
    }

    for (const [id, data] of Object.entries(journeyData["emailTemplates"])) {
        emailTemplatesMap[id] = data.displayName;
    }

    treeMap.nodeTypes = nodeTypeMap;
    treeMap.scripts = scriptsMap;
    treeMap.emailTemplates = emailTemplatesMap;
    return treeMap;
}

async function putNodeData(id, nodeType, data) {
    try {
        const urlString = util.format(nodeURLTemplate, storage.session.getTenant(), getCurrentRealmPath(storage.session.getRealm()), nodeType, id);
        const response = await generateAmApi(getTreeApiConfig()).put(
            urlString,
            data,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error(`PutNodeData ERROR: put script call returned ${response.status}, details: ${response}`);
            return null;
        }
        if (response.data._id != id) {
            console.error(`PutNodeData ERROR: generic error importing script ${id}`);
            return null;
        }
        return "";
    } catch (e) {
        console.error(`PutNodeData ERROR: put script error, script ${id} - ${e}`, e);
        return null;
    }
}

async function putJourneyStructureData(id, data) {
    try {
        const jURL = util.format(journeyURLTemplate, storage.session.getTenant(), getCurrentRealmPath(storage.session.getRealm()), id);
        const response = await generateAmApi(getTreeApiConfig()).get(
            urlString,
            data,
            { withCredentials: true },
        );
        if (response.status < 200 || response.status > 399) {
            console.error(`putJourneyStructureData ERROR: put journey structure call returned ${response.status}, details: ${response}`);
            return null;
        }
        if (response.data._id != id) {
            console.error(`putJourneyStructureData ERROR: generic error importing journey structure ${id}`);
            return null;
        }
        return "";
    } catch (e) {
        console.error(`putJourneyStructureData ERROR: put journey structure error, journey ${id} - ${e.message}`, e);
        return null;
    }
}

export async function importJourney(id, journeyMap, noreuuid, single) {
    let newUuid = "";
    const uuidMap = {};

    const sourceOrigin = journeyMap.origin;
    const targetOrigin = getOrigin(storage.session.getTenant(), storage.session.getRealm());
    const treeId = journeyMap.tree._id;

    if (sourceOrigin == targetOrigin) {
        console.log(`Importing journey ${treeId} to the same environment and realm from where it was exported`);
    }

    process.stdout.write("Importing scripts ")
    for (const [scriptId, scriptData] of Object.entries(journeyMap.scripts)) {
        single ? process.stdout.write(`[${scriptData.name}] `) : process.stdout.write(".");
        if (await putScript(scriptId, scriptData) == null) {
            console.error(`importJourney ERROR: error importing script ${id} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing email templates ")
    for (const [templateId, templateData] of Object.entries(journeyMap.emailTemplates)) {
        let templateLongId = templateData._id;
        single ? process.stdout.write(`[${templateId}] `) : process.stdout.write(".");
        if (await putEmailTemplate(templateId, templateLongId, templateData) == null) {
            console.error(`importJourney ERROR: error importing template ${id} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing inner nodes (nodes inside page nodes) ")
    for (const [innerNodeId, innerNodeData] of Object.entries(journeyMap.innernodes)) {
        let nodeType = innerNodeData._type._id;
        single ? process.stdout.write(`[${innerNodeId}] `) : process.stdout.write(".");
        if (noreuuid) {
            newUuid = innerNodeId;
        } else {
            newUuid = uuidv4();
            uuidMap[innerNodeId] = newUuid;
        }
        innerNodeData._id = newUuid;

        if (await putNodeData(newUuid, nodeType, innerNodeData) == null) {
            console.error(`importJourney ERROR: error importing inner node ${innerNodeId}:${newUuid} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing nodes ")
    for (let [nodeId, nodeData] of Object.entries(journeyMap.nodes)) {
        let nodeType = nodeData._type._id;
        single ? process.stdout.write(`[${nodeId}] `) : process.stdout.write(".");
        if (noreuuid) {
            newUuid = nodeId;
        } else {
            newUuid = uuidv4();
            uuidMap[nodeId] = newUuid;
        }
        nodeData._id = newUuid;
        // console.log(uuidMap);

        if (nodeType == "PageNode" && !noreuuid) {
            for (const [inPageNodeId, inPageNodeData] of Object.entries(nodeData.nodes)) {
                let currentId = inPageNodeData._id;
                // console.log(nodeData);
                nodeData = JSON.parse(replaceAll(JSON.stringify(nodeData), currentId, uuidMap[currentId]));
                // console.log(nodeData);
            }
        }

        if (await putNodeData(newUuid, nodeType, nodeData) == null) {
            console.error(`importJourney ERROR: error importing inner node ${nodeId}:${newUuid} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing journey structure ")
    const idForUrl = encodeURIComponent(id);
    journeyMap.tree._id = id;
    let journeyText = JSON.stringify(journeyMap.tree, null, 2);
    if (!noreuuid) {
        for (const [oldId, newId] of Object.entries(uuidMap)) {
            journeyText = replaceAll(journeyText, oldId, newId);
        }
    }
    journeyData = JSON.parse(journeyText);
    if (await putJourneyStructureData(idForUrl, journeyData) == null) {
        console.error(`importJourney ERROR: error importing journey structure ${treeId}`);
        return null;
    }
    process.stdout.write("done\n");
    return "";
}

async function resolveDependencies(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys, index = -1) {
    let before = -1;
    let trees = [];
    if (index == -1) {
        trees = Object.keys(journeyMap.trees);
    } else {
        before = index;
        trees = [...unresolvedJourneys];
    }

    for (const tree in trees) {
        const dependencies = [];
        process.stdout.write(".");
        for (const node in trees[tree].nodes) {
            if (trees[tree].nodes[node]._type._id == "InnerTreeEvaluatorNode") {
                dependencies.push(trees[tree].nodes[node].tree);
            }
        }
        let allResolved = true;
        for (const dependency of dependencies) {
            process.stdout.write(".");
            if (!resolvedJourneys.includes(dependency) && !installedJorneys.includes(dependency)) {
                allResolved = false;
            }
        }
        if (allResolved) {
            resolvedJourneys.push(tree);
            // remove from unresolvedJourneys array
            unresolvedJourneys.splice(unresolvedJourneys.indexOf(tree), 1);
        } else {
            if (!unresolvedJourneys.includes(tree)) {
                unresolvedJourneys.push(tree);
            }
        }
    }
    after = unresolvedJourneys.length;
    if (index != -1 && after == before) {
        console.log("Trees with unresolved dependencies: {}", unresolvedJourneys);
    } else if (after > 0) {
        resolveDependencies(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys, after);
    }
}

export async function importAllJourneys(journeyMap, noreuuid, single) {
    const installedJorneys = (await listJourneys(false)).map(x => x.name);
    const unresolvedJourneys = [];
    const resolvedJourneys = [];
    resolveDependencies(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys);
    for (const tree of resolvedJourneys) {
        importJourney(id, journeyMap[tree], noreuuid, single);
    }
}

export async function findOrphanedNodes(allNodes, orphanedNodes) {
    const allJourneys = await getAllJourneyData();
    const activeNodes = [];
    allJourneys.forEach(async journey => {
        for (const nodeId in journey.nodes) {
            activeNodes.push(nodeId);
            const node = journey.nodes[nodeId]
            if (containerNodes.includes(node.nodeType)) {
                const containerNode = await getNodeData(nodeId, node.nodeType);
                containerNode.nodes.forEach(n => {
                    activeNodes.push(n._id);
                })
            }
        }
    });
    // console.log(activeNodes)
    (await getAllNodesData()).forEach(x => allNodes.push(x._id));
    // console.log(allNodes)
    // filter nodes which are not present in activeNodes
    const diff = allNodes.filter(x => !activeNodes.includes(x));
    // console.log(activeNodes.length);
    diff.forEach(x => orphanedNodes.push(x));
    return;
}

export async function removeOrphanedNodes(allNodes, orphanedNodes) {
    orphanedNodes.forEach(async node => {
        process.stdout.write(".");
        await deleteNode(node, allNodes.find(x => x._id == node)._type._id);
    })
}

var OOTB_NODE_TYPES_7 = [
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

var OOTB_NODE_TYPES_7_1 = [
	"PushRegistrationNode",
	"GetAuthenticatorAppNode",
	"MultiFactorRegistrationOptionsNode",
	"OptOutMultiFactorAuthenticationNode"
].concat(OOTB_NODE_TYPES_7);

var OOTB_NODE_TYPES_7_2 = [
	"OathRegistrationNode",
	"OathTokenVerifierNode",
	"PassthroughAuthenticationNode",
	"ConfigProviderNode",
    "DebugNode"
].concat(OOTB_NODE_TYPES_7_1);

var OOTB_NODE_TYPES_6_5 = [
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

var OOTB_NODE_TYPES_6 = [
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