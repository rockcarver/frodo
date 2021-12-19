const crypto = require('crypto');
const axios = require('axios').default;
const axiosRetry = require('axios-retry');
axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  retryCondition: (_error) => true // retry no matter what
});
const util = require('util');
const utils = require('../../utils.js')
const { v4: uuidv4 } = require('uuid');
const { resolve } = require('path');

const journeyURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/trees/%s"
const nodeURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/nodes/%s/%s"
const scriptURLTemplate = "%s/json%s/scripts/%s"
const emailTemplateURLTemplate = "%s/openidm/config/emailTemplate/%s"
const queryAllTreesURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/trees?_queryFilter=true"
const queryAllNodesURLTemplate = "%s/json%s/realm-config/authentication/authenticationtrees/nodes?_action=nextdescendents"

const containerNodes = [
    "PageNode",
    "CustomPageNode"
];

const scriptedNodes = [
    "ConfigProviderNode",
    "ScriptedDecisionNode",
    "ClientScriptNode",
    "CustomScriptNode"
];

const emailTemplateNodes = [
    "EmailSuspendNode",
    "EmailTemplateNode"
];

function GetOrigin(tenant, realm) {
    return crypto.createHash('md5').update(`${tenant}${realm}`).digest("hex");
}

async function IsCustom(frToken, journey) {
    let ootbNodeTypes = [];
    const nodeList = journey["nodes"]
    // console.log(nodeList);
    // console.log(frToken.version);
    switch(frToken.version) {
        case "7.1.0":
            ootbNodeTypes = utils.ootbnodetypes_7_1.slice(0);
            break;
        case "7.2.0":
            // console.log("here");
            ootbNodeTypes = utils.ootbnodetypes_7_2.slice(0);
            break;
        case "7.0.0":
        case "7.0.1":
        case "7.0.2":
            ootbNodeTypes = utils.ootbnodetypes_7.slice(0);
            break;
        case "6.5.3":
        case "6.5.2.3":
        case "6.5.2.2":
        case "6.5.2.1":
        case "6.5.2":
        case "6.5.1":
        case "6.5.0.2":
        case "6.5.0.1":
            ootbNodeTypes = utils.ootbnodetypes_6_5.slice(0);
            break;
        case "6.0.0.7":
        case "6.0.0.6":
        case "6.0.0.5":
        case "6.0.0.4":
        case "6.0.0.3":
        case "6.0.0.2":
        case "6.0.0.1":
        case "6.0.0":
            ootbNodeTypes = utils.ootbnodetypes_6.slice(0);
            break;
        default:
            return true;
    }
    for(const node in nodeList) {
        if(!ootbNodeTypes.includes(nodeList[node].nodeType)) {
            return true;
        }
        if(containerNodes.includes(nodeList[node].nodeType)) {
            // console.log(nodeList[node])
            pageNode = await GetNodeData(frToken, node, nodeList[node].nodeType)
            if(pageNode != null) {
                for(const pnode of pageNode.nodes) {
                    if(!ootbNodeTypes.includes(pnode.nodeType)) {
                        return true;
                    }
                }
            } else {
                console.error(`IsCustom ERROR: can't get ${nodeList[node].nodeType} with id ${node} in ${journey._id}`);
                return false;
            }
        }
    }
    return false;
}

async function GetAllJourneyData(frToken) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(queryAllTreesURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm))
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("GetAllJourneyData ERROR: get all journeys call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        if("result" in response.data) {
            return response.data.result;
        }
        // console.log(journeyList);
        return null;
    } catch(e) {
        console.error("GetAllJourneyData ERROR: error getting all journey data - ", e.message);
        return null;
    }
}

async function GetAllNodesData(frToken) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(queryAllNodesURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm))
        const response = await axios.post(jURL, {}, options);
        if(response.status < 200 || response.status > 399) {
            console.error("GetAllNodesData ERROR: get all nodes call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        if("result" in response.data) {
            return response.data.result;
        }
        return null;
    } catch(e) {
        console.error("GetAllNodesData ERROR: error getting all nodes data - ", e.message);
        return null;
    }
}

async function ListJourneys(frToken) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(queryAllTreesURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm))
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("ListJourneys ERROR: list journeys call returned %d, possible cause: invalid credentials", response.status);
            return null;
        }
        let journeyList = [];
        if("result" in response.data) {
            const journeys = response.data.result;
            for(const journey of journeys) {
                let customTree = await IsCustom(frToken, journey);
                journeyList.push({name: journey._id, custom: customTree});
            }
        }
        // console.log(journeyList);
        return journeyList;
    } catch(e) {
        console.error("ListJourneys ERROR: error getting journey list - ", e.message);
        return null;
    }
}

async function GetNodeData(frToken, id, nodeType) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(nodeURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), nodeType, id);
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("GetNodeData ERROR: get node call returned %d, possible cause: node not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("GetNodeData ERROR: error getting node - ", e.message);
        return null;
    }
}

async function DeleteNode(frToken, id, nodeType) {
    const headers = {
        "Accept-API-Version": utils.amApiVersion,
        "X-Requested-With": "XmlHttpRequest",
        "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
    };
    try {
        const jURL = util.format(nodeURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), nodeType, id);
        const response = await axios.delete(jURL, {headers: headers});
        if(response.status < 200 || response.status > 399) {
            console.error("DeleteNode ERROR: delete node call returned %d, possible cause: node not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("DeleteNode ERROR: error deleting node - ", e.message);
        return null;
    }
}

async function GetJourneyStructureData(frToken, name) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(journeyURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), name);
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("\nGetJourneyStructureData ERROR: get journey structure call returned %d, possible cause: journey not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("\nGetJourneyStructureData ERROR: get journey structure error - ", e.message);
        return null;
    }
}

async function GetScriptData(frToken, id) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(scriptURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), id);
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("GetScriptData ERROR: get script structure call returned %d, possible cause: script not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("GetScriptData ERROR: get script structure error - ", e.message);
        return null;
    }
}

async function GetEmailTemplateData(frToken, id) {
    const options = {
        headers: {
            "Authorization": "Bearer " + frToken.bearerToken
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(emailTemplateURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        // console.log(jURL)
        const response = await axios.get(jURL, options);
        if(response.status < 200 || response.status > 399) {
            console.error("GetEmailTemplateData ERROR: get email template data call returned %d, possible cause: email template not found", response.status);
            return null;
        }
        return response.data;
    } catch(e) {
        console.error("GetEmailTemplateData ERROR: get email template data error - ", e.message);
        return null;
    }
}


async function GetJourneyData(frToken, journey) {
    process.stdout.write(`${journey}`);

    const journeyMap = {};
    const nodesMap = {};
    const scriptsMap = {};
    const emailTemplatesMap = {};
    const inPageNodesMap = {};

    journeyMap["origin"] = GetOrigin(frToken.tenant, frToken.realm);

    // read tree object
    const journeyStructureData = await GetJourneyStructureData(frToken, journey);
    // console.log(journeyStructureData);
    if (journeyStructureData != null) {
        // exports = {"origin":"$ORIGIN", "innernodes":{}, "nodes":{}, "scripts":{}, "emailTemplates":{}}
        delete journeyStructureData["_rev"];

        // iterate over every node in tree
        for (const [nodeId, nodeInfo] of Object.entries(journeyStructureData["nodes"])) {
            // console.log(nodeInfo["nodeType"]);
            const nodeData = await GetNodeData(frToken, nodeId, nodeInfo["nodeType"]);
            delete nodeData["_rev"];
            nodesMap[nodeId] = nodeData;
            process.stdout.write(".");
            
            // console.log(nodeData);
            
            if(scriptedNodes.includes(nodeInfo.nodeType)) {
                scriptsMap[nodeData.script] = await GetScriptData(frToken, nodeData.script);
                process.stdout.write(".");
            }

            if(frToken.deploymentType == "Cloud" || frToken.deploymentType == "ForgeOps") {
                if(emailTemplateNodes.includes(nodeInfo.nodeType)) {
                    emailTemplatesMap[nodeData.emailTemplateName] = await GetEmailTemplateData(frToken, nodeData.emailTemplateName);
                    process.stdout.write(".");
                }
            }

            if(containerNodes.includes(nodeInfo.nodeType)) {
                for (const inPageNode of nodeData["nodes"]) {
                    const inPageNodeData = await GetNodeData(frToken, inPageNode._id, inPageNode.nodeType);
                    delete inPageNodeData["_rev"];
                    inPageNodesMap[inPageNode._id] = inPageNodeData;

                    if(scriptedNodes.includes(inPageNode.nodeType)) {
                        scriptsMap[inPageNodeData.script] = await GetScriptData(frToken, inPageNodeData.script);
                        process.stdout.write(".");
                    }

                    if(frToken.deploymentType == "Cloud" || frToken.deploymentType == "ForgeOps") {
                        if(emailTemplateNodes.includes(inPageNode.nodeType)) {
                            emailTemplatesMap[inPageNodeData.emailTemplateName] = await GetEmailTemplateData(frToken, inPageNodeData.emailTemplateName);
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

function DescribeTree(journeyData) {
    const treeMap = {};
    const nodeTypeMap = {};
    const scriptsMap = {};
    treeMap.treeName = journeyData.tree._id;
    for (const [nodeId, nodeData] of Object.entries(journeyData["nodes"])) {
        if(nodeTypeMap[nodeData._type._id]) {
            nodeTypeMap[nodeData._type._id] += 1;
        } else {
            nodeTypeMap[nodeData._type._id] = 1;
        }
    }

    for (const [nodeId, nodeData] of Object.entries(journeyData["innernodes"])) {
        if(nodeTypeMap[nodeData._type._id]) {
            nodeTypeMap[nodeData._type._id] += 1;
        } else {
            nodeTypeMap[nodeData._type._id] = 1;
        }
    }

    for (const [scriptId, scriptData] of Object.entries(journeyData["scripts"])) {
        scriptsMap[scriptData.name] = scriptData.description;
    }
    treeMap.nodeTypes = nodeTypeMap;
    treeMap.scripts = scriptsMap;
    return treeMap;
}

async function PutNodeData(frToken, id, nodeType, data) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Content-Type": "application/json",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(nodeURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), nodeType, id);
        const response = await axios.put(jURL, data, options);
        if(response.status < 200 || response.status > 399) {
            console.error(`PutNodeData ERROR: put script call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data._id != id) {
            console.error(`PutNodeData ERROR: generic error importing script ${id}`);
            return null;
        }
        return "";
    } catch(e) {
        console.error(`PutNodeData ERROR: put script error, script ${id} - ${e}`, e);
        return null;
    }
}

async function PutScriptData(frToken, id, data) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Content-Type": "application/json",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(scriptURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), id);
        const response = await axios.put(jURL, data, options);
        if(response.status < 200 || response.status > 399) {
            console.error(`PutScriptData ERROR: put script call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data._id != id) {
            console.error(`PutScriptData ERROR: generic error importing script ${id}`);
            return null;
        }
        return "";
    } catch(e) {
        if(e.response.status == 409) {
            console.error("PutScriptData WARNING: script with name [%s] already exists, using renaming policy... <name> => <name - imported (n)>", data.name);
            let newName = utils.ApplyRenamingPolicy(data.name);
            //console.log(newName);
            console.log("Trying to save script as %s", newName);
            data.name = newName;
            PutScriptData(frToken, id, data);
            return "";
        }
        console.error(`PutScriptData ERROR: put script error, script ${id} - ${e.message}`);
        return null;
    }
}

async function PutEmailTemplateData(frToken, id, longid, data) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${frToken.bearerToken}`
        },
        timeout: utils.timeout
    };

    try {
        const jURL = util.format(emailTemplateURLTemplate, utils.GetTenantURL(frToken.tenant), id);
        const response = await axios.put(jURL, data, options);
        if(response.status < 200 || response.status > 399) {
            console.error(`PutEmailTemplateData ERROR: put template call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data._id != longid) {
            console.error(`PutEmailTemplateData ERROR: generic error importing template ${id}`);
            return null;
        }
        return "";
    } catch(e) {
        // if(e.response.status == 409) {
        //     console.error("PutEmailTemplateData ERROR: template with name [%s] already exists, using renaming policy... <name> => <name - imported (n)>", data.name);
        //     let newName = utils.ApplyRenamingPolicy(data.name);
        //     //console.log(newName);
        //     console.log("Trying to save script as %s", newName);
        //     data.name = newName;
        //     PutScriptData(frToken, id, data);
        //     return "";
        // }
        console.error(`PutEmailTemplateData ERROR: put template error, script ${id} - ${e.message}`);
        return null;
    }
}

async function PutJourneyStructureData(frToken, id, data) {
    const options = {
        headers: {
            "Accept-API-Version": utils.amApiVersion,
            "X-Requested-With": "XmlHttpRequest",
            "Content-Type": "application/json",
            "Cookie": `${frToken.cookieName}=${frToken.cookieValue}`
        },
        timeout: utils.timeout
    };
    try {
        const jURL = util.format(journeyURLTemplate, frToken.tenant, utils.GetRealmUrl(frToken.realm), id);
        const response = await axios.put(jURL, data, options);
        if(response.status < 200 || response.status > 399) {
            console.error(`PutJourneyStructureData ERROR: put journey structure call returned ${response.status}, details: ${response}`);
            return null;
        }
        if(response.data._id != id) {
            console.error(`PutJourneyStructureData ERROR: generic error importing journey structure ${id}`);
            return null;
        }
        return "";
    } catch(e) {
        console.error(`PutJourneyStructureData ERROR: put journey structure error, journey ${id} - ${e.message}`, e);
        return null;
    }
}

async function ImportJourney(frToken, id, journeyMap, noreuuid, single) {
    let newUuid = "";
    const uuidMap = {};

    const sourceOrigin = journeyMap.origin;
    const targetOrigin = GetOrigin(frToken.tenant, frToken.realm);
    const treeId = journeyMap.tree._id;
    
    if(sourceOrigin == targetOrigin) {
        console.log(`Importing journey ${treeId} to the same environment and realm from where it was exported`);
    }

    process.stdout.write("Importing scripts ")
    for (const [scriptId, scriptData] of Object.entries(journeyMap.scripts)) {
        single?process.stdout.write(`[${scriptData.name}] `):process.stdout.write(".");
        if(await PutScriptData(frToken, scriptId, scriptData) == null) {
            console.error(`ERROR: error importing script ${id} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing email templates ")
    for (const [templateId, templateData] of Object.entries(journeyMap.emailTemplates)) {
        let templateLongId = templateData._id;
        single?process.stdout.write(`[${templateId}] `):process.stdout.write(".");
        if(await PutEmailTemplateData(frToken, templateId, templateLongId, templateData) == null) {
            console.error(`ERROR: error importing template ${id} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing inner nodes (nodes inside page nodes) ")
    for (const [innerNodeId, innerNodeData] of Object.entries(journeyMap.innernodes)) {
        let nodeType = innerNodeData._type._id;
        single?process.stdout.write(`[${innerNodeId}] `):process.stdout.write(".");
        if(noreuuid) {
            newUuid = innerNodeId;
        } else {
            newUuid = uuidv4();
            uuidMap[innerNodeId] = newUuid;
        }
        innerNodeData._id = newUuid;

        if(await PutNodeData(frToken, newUuid, nodeType, innerNodeData) == null) {
            console.error(`ERROR: error importing inner node ${innerNodeId}:${newUuid} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing nodes ")
    for (let [nodeId, nodeData] of Object.entries(journeyMap.nodes)) {
        let nodeType = nodeData._type._id;
        single?process.stdout.write(`[${nodeId}] `):process.stdout.write(".");
        if(noreuuid) {
            newUuid = nodeId;
        } else {
            newUuid = uuidv4();
            uuidMap[nodeId] = newUuid;
        }
        nodeData._id = newUuid;
        // console.log(uuidMap);

        if(nodeType == "PageNode" && !noreuuid) {
            for (const [inPageNodeId, inPageNodeData] of Object.entries(nodeData.nodes)) {
                let currentId = inPageNodeData._id;
                // console.log(nodeData);
                nodeData = JSON.parse(utils.replaceAll(JSON.stringify(nodeData), currentId, uuidMap[currentId]));
                // console.log(nodeData);
            }
        }

        if(await PutNodeData(frToken, newUuid, nodeType, nodeData) == null) {
            console.error(`ERROR: error importing inner node ${nodeId}:${newUuid} in journey ${treeId}`);
            return null;
        }
    }
    process.stdout.write("done\n");

    process.stdout.write("Importing journey structure ")
    const idForUrl = encodeURIComponent(id);
    journeyMap.tree._id = id;
    let journeyText = JSON.stringify(journeyMap.tree, null, 2);
    if(!noreuuid) {
        for(const [oldId, newId] of Object.entries(uuidMap)) {
            journeyText = utils.replaceAll(journeyText, oldId, newId);
        }
    }
    journeyData = JSON.parse(journeyText);
    if(await PutJourneyStructureData(frToken, idForUrl, journeyData) == null) {
        console.error(`ERROR: error importing journey structure ${treeId}`);
        return null;
    }
    process.stdout.write("done\n");
    return "";
}

async function ResolveDependency(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys, index=-1) {
    let before = -1;
    let trees = [];
    if(index == -1) {
        trees = Object.keys(journeyMap.trees);
    } else {
        before = index;
        trees = [...unresolvedJourneys];
    }

    for(const tree in trees) {
        const dependencies = [];
        process.stdout.write(".");
        for(const node in trees[tree].nodes) {
            if(trees[tree].nodes[node]._type._id == "InnerTreeEvaluatorNode") {
                dependencies.push(trees[tree].nodes[node].tree);
            }
        }
        let allResolved = true;
        for(const dependency of dependencies) {
            process.stdout.write(".");
            if(!resolvedJourneys.includes(dependency) && !installedJorneys.includes(dependency)) {
                allResolved = false;
            }
        }
        if(allResolved) {
            resolvedJourneys.push(tree);
            // remove from unresolvedJourneys array
            unresolvedJourneys.splice(unresolvedJourneys.indexOf(tree), 1);
        } else {
            if(!unresolvedJourneys.includes(tree)) {
                unresolvedJourneys.push(tree);
            }
        }
    }
    after = unresolvedJourneys.length;
    if(index != -1 && after == before) {
        console.log("Trees with unresolved dependencies: {}", unresolvedJourneys);
    } else if(after > 0) {
        ResolveDependency(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys, after);
    }
}

async function ImportAllJourneys(frToken, journeyMap, noreuuid, single) {
    const installedJorneys = (await ListJourneys(frToken)).map(x => x.name);
    const unresolvedJourneys = [];
    const resolvedJourneys = [];
    ResolveDependency(installedJorneys, journeyMap, unresolvedJourneys, resolvedJourneys);
    for(const tree of resolvedJourneys) {
        ImportJourney(frToken, id, journeyMap[tree], noreuuid, single);
    }
}

async function FindOrphanedNodes(frToken, allNodes, orphanedNodes) {
    const allJourneys = await GetAllJourneyData(frToken);
    const activeNodes = [];
    allJourneys.forEach(async journey => {
        for(const nodeId in journey.nodes) {
            activeNodes.push(nodeId);
            const node = journey.nodes[nodeId]
            if(containerNodes.includes(node.nodeType)) {
                const containerNode = await GetNodeData(frToken, nodeId, node.nodeType);
                containerNode.nodes.forEach(n => {
                    activeNodes.push(n._id);
                })
            }
        }
    });
    // console.log(activeNodes)
    (await GetAllNodesData(frToken)).forEach(x => allNodes.push(x._id));
    // console.log(allNodes)
    // filter nodes which are not present in activeNodes
    const diff = allNodes.filter(x => !activeNodes.includes(x));
    // console.log(activeNodes.length);
    diff.forEach(x => orphanedNodes.push(x));
    return;
}

async function RemoveOrphanedNodes(frToken, allNodes, orphanedNodes) {
    orphanedNodes.forEach(async node=>{
        process.stdout.write(".");
        await DeleteNode(frToken, node, allNodes.find(x => x._id == node)._type._id);
    })
}

module.exports.FindOrphanedNodes = FindOrphanedNodes;
module.exports.RemoveOrphanedNodes = RemoveOrphanedNodes;
module.exports.ImportJourney = ImportJourney;
module.exports.ImportAllJourneys = ImportAllJourneys;
module.exports.ListJourneys = ListJourneys;
module.exports.DescribeTree = DescribeTree;
module.exports.GetJourneyData = GetJourneyData;