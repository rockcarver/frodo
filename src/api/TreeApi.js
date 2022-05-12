import crypto from 'crypto';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentRealmPath, replaceAll } from './utils/ApiUtils.js';
import { generateAmApi } from './BaseApi.js';
import storage from '../storage/SessionStorage.js';
import { getEmailTemplate, putEmailTemplate } from './EmailTemplateApi.js';
import { getScript, putScript } from './ScriptApi.js';
import * as global from '../storage/StaticStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
  showSpinner,
  stopSpinner,
} from './utils/Console.js';

const journeyURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/trees/%s';
const nodeURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes/%s/%s';
const queryAllTreesURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/trees?_queryFilter=true';
const queryAllNodesURLTemplate =
  '%s/json%s/realm-config/authentication/authenticationtrees/nodes?_action=nextdescendents';

const apiVersion = 'protocol=2.1,resource=1.0';
const getTreeApiConfig = () => {
  const configPath = getCurrentRealmPath();
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

const containerNodes = ['PageNode', 'CustomPageNode'];

const scriptedNodes = [
  'ConfigProviderNode',
  'ScriptedDecisionNode',
  'ClientScriptNode',
  'SocialProviderHandlerNode',
  'CustomScriptNode',
];

const emailTemplateNodes = ['EmailSuspendNode', 'EmailTemplateNode'];

function getOrigin(tenant, realm) {
  return crypto.createHash('md5').update(`${tenant}${realm}`).digest('hex');
}

async function getAllJourneyData() {
  const urlString = util.format(
    queryAllTreesURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  const response = await generateAmApi(getTreeApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return [];
    });
  return response.data.result;
}

async function getAllNodesData() {
  const urlString = util.format(
    queryAllNodesURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath()
  );
  const response = await generateAmApi(getTreeApiConfig())
    .post(urlString, {}, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return [];
    });
  return response.data.result;
}

async function getNodeData(id, nodeType) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    nodeType,
    id
  );
  const response = await generateAmApi(getTreeApiConfig())
    .get(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  // console.dir(response.data);
  return response.data;
}

async function deleteNode(id, nodeType) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(),
    nodeType,
    id
  );
  const response = await generateAmApi(getTreeApiConfig())
    .delete(urlString, {
      withCredentials: true,
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  // console.dir(response.data);
  return response.data;
}

async function getJourneyStructureData(name) {
  try {
    const urlString = util.format(
      journeyURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath(),
      name
    );
    const response = await generateAmApi(getTreeApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `\ngetJourneyStructureData ERROR: get journey structure call returned ${response.status}, possible cause: journey not found`,
        'error'
      );
      return null;
    }
    return response.data;
  } catch (e) {
    printMessage(
      `\ngetJourneyStructureData ERROR: get journey structure error - ${e.message}`,
      'error'
    );
    return null;
  }
}

export async function getJourneyData(journey) {
  //   printMessage(`${journey}`, 'text', false);

  const journeyMap = {};
  const nodesMap = {};
  const scriptsMap = {};
  const emailTemplatesMap = {};
  const innerNodesMap = {};

  journeyMap.origin = getOrigin(
    storage.session.getTenant(),
    storage.session.getRealm()
  );

  // read tree object
  const journeyStructureData = await getJourneyStructureData(journey);
  // console.log(journeyStructureData);
  if (journeyStructureData != null) {
    // exports = {"origin":"$ORIGIN", "innernodes":{}, "nodes":{}, "scripts":{}, "emailTemplates":{}}
    delete journeyStructureData._rev;

    // NEW CODE

    // iterate over every node in tree
    const nodeDataPromises = [];
    const scriptPromises = [];
    const emailTemplatePromises = [];
    const innerNodeDataPromises = [];
    const innerScriptPromises = [];
    const innerEmailTemplatePromises = [];
    for (const [nodeId, nodeInfo] of Object.entries(
      journeyStructureData.nodes
    )) {
      nodeDataPromises.push(getNodeData(nodeId, nodeInfo.nodeType));
      //   printMessage('.', 'text', false);
    }
    const nodeDataResults = await Promise.all(nodeDataPromises);
    nodeDataResults.forEach(async (entry) => {
      const nodeData = entry;
      delete nodeData._rev;
      nodesMap[nodeData._id] = nodeData;
      //   printMessage('.', 'text', false);

      // handle script node types
      if (scriptedNodes.includes(nodeData._type._id)) {
        scriptPromises.push(getScript(nodeData.script));
        // printMessage('.', 'text', false);
      }

      // frodo supports email templates in platform deployments
      if (
        storage.session.getDeploymentType() ===
          global.CLOUD_DEPLOYMENT_TYPE_KEY ||
        storage.session.getDeploymentType() ===
          global.FORGEOPS_DEPLOYMENT_TYPE_KEY
      ) {
        if (emailTemplateNodes.includes(nodeData._type._id)) {
          emailTemplatePromises.push(
            getEmailTemplate(nodeData.emailTemplateName)
          );
          //   printMessage('.', 'text', false);
        }
      }

      // handle nodes inside container nodes
      if (containerNodes.includes(nodeData._type._id)) {
        for (const innerNode of nodeData.nodes) {
          innerNodeDataPromises.push(
            getNodeData(innerNode._id, innerNode.nodeType)
          );
          //   printMessage('.', 'text', false);
        }
      }
    });
    const scripts = await Promise.all(scriptPromises);
    scripts.forEach((item) => {
      if (item) scriptsMap[item._id] = item;
    });
    const emailTemplates = await Promise.all(emailTemplatePromises);
    emailTemplates.forEach((item) => {
      emailTemplatesMap[item._id.split('/')[1]] = item;
    });

    const innerNodeDataResults = await Promise.all(innerNodeDataPromises);
    innerNodeDataResults.forEach(async (entry) => {
      const nodeData = entry;
      delete nodeData._rev;
      innerNodesMap[nodeData._id] = nodeData;
      //   printMessage('.', 'text', false);

      // handle script node types
      if (scriptedNodes.includes(nodeData._type._id)) {
        innerScriptPromises.push(getScript(nodeData.script));
        // printMessage('.', 'text', false);
      }

      // frodo supports email templates in platform deployments
      if (
        storage.session.getDeploymentType() ===
          global.CLOUD_DEPLOYMENT_TYPE_KEY ||
        storage.session.getDeploymentType() ===
          global.FORGEOPS_DEPLOYMENT_TYPE_KEY
      ) {
        if (emailTemplateNodes.includes(nodeData._type._id)) {
          innerEmailTemplatePromises.push(
            getEmailTemplate(nodeData.emailTemplateName)
          );
          //   printMessage('.', 'text', false);
        }
      }
    });
    const innerScripts = await Promise.all(innerScriptPromises);
    innerScripts.forEach((item) => {
      scriptsMap[item._id] = item;
    });
    const innerEmailTemplates = await Promise.all(innerEmailTemplatePromises);
    innerEmailTemplates.forEach((item) => {
      emailTemplatesMap[item._id] = item;
    });

    // // OLD CODE

    // // iterate over every node in tree
    // for (const [nodeId, nodeInfo] of Object.entries(
    //   journeyStructureData.nodes
    // )) {
    //   const nodeData = await getNodeData(nodeId, nodeInfo.nodeType);
    //   // console.log(nodeData);
    //   delete nodeData._rev;
    //   nodesMap[nodeId] = nodeData;
    //   printMessage('.', 'info', false);

    //   // handle script node types
    //   if (scriptedNodes.includes(nodeInfo.nodeType)) {
    //     scriptsMap[nodeData.script] = await getScript(nodeData.script);
    //     printMessage('.', 'info', false);
    //   }

    //   // frodo supports email templates in platform deployments
    //   if (
    //     storage.session.getDeploymentType() ===
    //       global.CLOUD_DEPLOYMENT_TYPE_KEY ||
    //     storage.session.getDeploymentType() ===
    //       global.FORGEOPS_DEPLOYMENT_TYPE_KEY
    //   ) {
    //     if (emailTemplateNodes.includes(nodeInfo.nodeType)) {
    //       emailTemplatesMap[nodeData.emailTemplateName] =
    //         await getEmailTemplate(nodeData.emailTemplateName);
    //       printMessage('.', 'info', false);
    //     }
    //   }

    //   // handle nodes inside container nodes
    //   if (containerNodes.includes(nodeInfo.nodeType)) {
    //     for (const inPageNode of nodeData.nodes) {
    //       const inPageNodeData = await getNodeData(
    //         inPageNode._id,
    //         inPageNode.nodeType
    //       );
    //       delete inPageNodeData._rev;
    //       innerNodesMap[inPageNode._id] = inPageNodeData;

    //       // handle script node types
    //       if (scriptedNodes.includes(inPageNode.nodeType)) {
    //         scriptsMap[inPageNodeData.script] = await getScript(
    //           inPageNodeData.script
    //         );
    //         printMessage('.', 'info', false);
    //       }

    //       // frodo supports email templates in platform deployments
    //       if (
    //         storage.session.getDeploymentType() ==
    //           global.CLOUD_DEPLOYMENT_TYPE_KEY ||
    //         storage.session.getDeploymentType() ==
    //           global.FORGEOPS_DEPLOYMENT_TYPE_KEY
    //       ) {
    //         if (emailTemplateNodes.includes(inPageNode.nodeType)) {
    //           emailTemplatesMap[inPageNodeData.emailTemplateName] =
    //             await getEmailTemplate(inPageNodeData.emailTemplateName);
    //           printMessage('.', 'info', false);
    //         }
    //       }
    //     }
    //   }
    // }
    // // END OLD CODE
  }

  journeyMap.innernodes = innerNodesMap;
  journeyMap.scripts = scriptsMap;
  journeyMap.emailTemplates = emailTemplatesMap;
  journeyMap.nodes = nodesMap;
  journeyMap.tree = journeyStructureData;
  //   printMessage('.');
  //   printMessage(
  //     `Nodes(inner): ${
  //       Object.keys(nodesMap).length + Object.keys(innerNodesMap).length
  //     }(${Object.keys(innerNodesMap).length}), Scripts: ${
  //       Object.keys(scriptsMap).length
  //     }, Email Templates: ${Object.keys(emailTemplatesMap).length}`
  //   );
  return journeyMap;
}

export function describeTree(journeyData) {
  const treeMap = {};
  const nodeTypeMap = {};
  const scriptsMap = {};
  const emailTemplatesMap = {};
  treeMap.treeName = journeyData.tree._id;
  for (const [, nodeData] of Object.entries(journeyData.nodes)) {
    if (nodeTypeMap[nodeData._type._id]) {
      nodeTypeMap[nodeData._type._id] += 1;
    } else {
      nodeTypeMap[nodeData._type._id] = 1;
    }
  }

  for (const [, nodeData] of Object.entries(journeyData.innernodes)) {
    if (nodeTypeMap[nodeData._type._id]) {
      nodeTypeMap[nodeData._type._id] += 1;
    } else {
      nodeTypeMap[nodeData._type._id] = 1;
    }
  }

  for (const [, scriptData] of Object.entries(journeyData.scripts)) {
    scriptsMap[scriptData.name] = scriptData.description;
  }

  for (const [id, data] of Object.entries(journeyData.emailTemplates)) {
    emailTemplatesMap[id] = data.displayName;
  }

  treeMap.nodeTypes = nodeTypeMap;
  treeMap.scripts = scriptsMap;
  treeMap.emailTemplates = emailTemplatesMap;
  return treeMap;
}

async function putNodeData(id, nodeType, data) {
  const urlString = util.format(
    nodeURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    nodeType,
    id
  );
  const response = await generateAmApi(getTreeApiConfig())
    .put(urlString, data, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(`Error setting up request - ${error.message}`, 'error');
      }
      printMessage(error.config, 'error');
      return null;
    });
  return response.data;
}

async function putJourneyStructureData(id, data) {
  const urlString = util.format(
    journeyURLTemplate,
    storage.session.getTenant(),
    getCurrentRealmPath(storage.session.getRealm()),
    id
  );
  const response = await generateAmApi(getTreeApiConfig())
    .put(urlString, data, { withCredentials: true })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        printMessage(
          `Error! The putJourneyStructureData request was made and the server responded with a status code! - ${error.message}`,
          'error'
        );
        printMessage(error.response.data, 'error');
        printMessage(error.response.status, 'error');
        printMessage(error.response.headers, 'error');
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        printMessage(
          `Error! The putJourneyStructureData request was made but no response was received! - ${error.message}`,
          'error'
        );
        printMessage(error.request, 'error');
      } else {
        // Something happened in setting up the request that triggered an Error
        printMessage(
          `Error setting up putJourneyStructureData request - ${error.message}`,
          'error'
        );
      }
      printMessage(error.config, 'error');
      return null;
    });
  if (response) {
    return response.data;
  }
  return null;
}

export async function importJourney(id, journeyMap, noreuuid) {
  printMessage(`- ${id}\n`, 'info', false);
  let newUuid = '';
  const uuidMap = {};

  const sourceOrigin = journeyMap.origin;
  const targetOrigin = getOrigin(
    storage.session.getTenant(),
    storage.session.getRealm()
  );
  const treeId = journeyMap.tree._id;

  if (sourceOrigin === targetOrigin) {
    printMessage(
      `- Importing journey ${treeId} to the same environment and realm from where it was exported`
    );
  }

  if (Object.entries(journeyMap.scripts).length > 0) {
    // printMessage('  - Scripts:\n');
    const scriptPromises = [];
    for (const [scriptId, scriptData] of Object.entries(journeyMap.scripts)) {
      scriptPromises.push(putScript(scriptId, scriptData));
    }
    Promise.all(scriptPromises).then((results) => {
      results.forEach((result) => {
        if (result.error) {
          printMessage(
            `importJourney ERROR: error importing script ${result.name} in journey ${treeId}`,
            'error'
          );
        } else {
          printMessage(`    - Script [${result.name}]`, 'info', false);
        }
      });
    });
    printMessage('');
  }

  if (Object.entries(journeyMap.emailTemplates).length > 0) {
    printMessage('  - Email templates:');
    for (const [templateId, templateData] of Object.entries(
      journeyMap.emailTemplates
    )) {
      const templateLongId = templateData._id;
      printMessage(`    - ${templateId}`, 'info', false);
      if (
        (await putEmailTemplate(templateId, templateLongId, templateData)) ==
        null
      ) {
        printMessage(
          `importJourney ERROR: error importing template ${templateId} in journey ${treeId}`,
          'error'
        );
        return null;
      }
      printMessage('');
    }
  }

  printMessage('  - Inner nodes:');
  for (const [innerNodeId, innerNodeData] of Object.entries(
    journeyMap.innernodes
  )) {
    const nodeType = innerNodeData._type._id;
    printMessage(`    - ${innerNodeId}`, 'info', false);
    if (noreuuid) {
      newUuid = innerNodeId;
    } else {
      newUuid = uuidv4();
      uuidMap[innerNodeId] = newUuid;
    }
    innerNodeData._id = newUuid;

    if ((await putNodeData(newUuid, nodeType, innerNodeData)) == null) {
      printMessage(
        `importJourney ERROR: error importing inner node ${innerNodeId}:${newUuid} in journey ${treeId}`,
        'error'
      );
      return null;
    }
    printMessage('');
  }

  printMessage('  - Nodes:');
  // eslint-disable-next-line prefer-const
  for (let [nodeId, nodeData] of Object.entries(journeyMap.nodes)) {
    const nodeType = nodeData._type._id;
    printMessage(`    - ${nodeId}`, 'info', false);
    if (noreuuid) {
      newUuid = nodeId;
    } else {
      newUuid = uuidv4();
      uuidMap[nodeId] = newUuid;
    }
    nodeData._id = newUuid;
    // console.log(uuidMap);

    if (nodeType === 'PageNode' && !noreuuid) {
      for (const [, inPageNodeData] of Object.entries(nodeData.nodes)) {
        const currentId = inPageNodeData._id;
        // console.log(nodeData);
        nodeData = JSON.parse(
          replaceAll(JSON.stringify(nodeData), currentId, uuidMap[currentId])
        );
        // console.log(nodeData);
      }
    }

    if ((await putNodeData(newUuid, nodeType, nodeData)) == null) {
      printMessage(
        `importJourney ERROR: error importing inner node ${nodeId}:${newUuid} in journey ${treeId}`,
        'error'
      );
      return null;
    }
    printMessage('');
  }

  printMessage('  - Flow');
  // eslint-disable-next-line no-param-reassign
  journeyMap.tree._id = id;
  let journeyText = JSON.stringify(journeyMap.tree, null, 2);
  if (!noreuuid) {
    for (const [oldId, newId] of Object.entries(uuidMap)) {
      journeyText = replaceAll(journeyText, oldId, newId);
    }
  }
  const journeyData = JSON.parse(journeyText);
  if ((await putJourneyStructureData(id, journeyData)) == null) {
    printMessage(
      `importJourney ERROR: error importing journey structure ${treeId}`,
      'error'
    );
    return null;
  }
  return '';
}

async function resolveDependencies(
  installedJorneys,
  journeyMap,
  unresolvedJourneys,
  resolvedJourneys,
  index = -1
) {
  let before = -1;
//   let trees = [];
  let after = index;
  if (index === -1) {
    showSpinner('Resolving dependencies');
    // trees = Object.keys(journeyMap);
  } else {
    before = index;
    // trees = [...unresolvedJourneys];
  }

  for (const tree in journeyMap) {
    if ({}.hasOwnProperty.call(journeyMap, tree)) {
      // console.dir(journeyMap[tree]);
      const dependencies = [];
      for (const node in journeyMap[tree].nodes) {
        if (
          journeyMap[tree].nodes[node]._type._id === 'InnerTreeEvaluatorNode'
        ) {
          dependencies.push(journeyMap[tree].nodes[node].tree);
        }
      }
      let allResolved = true;
      for (const dependency of dependencies) {
        if (
          !resolvedJourneys.includes(dependency) &&
          !installedJorneys.includes(dependency)
        ) {
          allResolved = false;
        }
      }
      if (allResolved) {
        resolvedJourneys.push(tree);
        // remove from unresolvedJourneys array
        unresolvedJourneys.splice(unresolvedJourneys.indexOf(tree), 1);
      } else if (!unresolvedJourneys.includes(tree)) {
        unresolvedJourneys.push(tree);
      }
    }
  }
  after = unresolvedJourneys.length;
  if (index !== -1 && after === before) {
    printMessage('Trees with unresolved dependencies: {}', unresolvedJourneys);
  } else if (after > 0) {
    resolveDependencies(
      installedJorneys,
      journeyMap,
      unresolvedJourneys,
      resolvedJourneys,
      after
    );
  }
  stopSpinner();
}

export async function findOrphanedNodes(allNodes, orphanedNodes) {
  const allJourneys = await getAllJourneyData();
  const activeNodes = [];
  allJourneys.forEach(async (journey) => {
    for (const nodeId in journey.nodes) {
      if ({}.hasOwnProperty.call(journey.nodes, nodeId)) {
        activeNodes.push(nodeId);
        const node = journey.nodes[nodeId];
        if (containerNodes.includes(node.nodeType)) {
          const containerNode = await getNodeData(nodeId, node.nodeType);
          containerNode.nodes.forEach((n) => {
            activeNodes.push(n._id);
          });
        }
      }
    }
  });
  (await getAllNodesData()).forEach((node) => {
    allNodes.push(node);
  });
  // filter nodes which are not present in activeNodes
  const diff = allNodes.filter((x) => !activeNodes.includes(x._id));
  diff.forEach((x) => orphanedNodes.push(x));
}

export async function removeOrphanedNodes(allNodes, orphanedNodes) {
  orphanedNodes.forEach(async (node) => {
    printMessage('.', 'text', false);
    await deleteNode(node._id, node._type._id);
  });
}

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

const OOTB_NODE_TYPES_7_1 = [
  'PushRegistrationNode',
  'GetAuthenticatorAppNode',
  'MultiFactorRegistrationOptionsNode',
  'OptOutMultiFactorAuthenticationNode',
].concat(OOTB_NODE_TYPES_7);

const OOTB_NODE_TYPES_7_2 = [
  'OathRegistrationNode',
  'OathTokenVerifierNode',
  'PassthroughAuthenticationNode',
  'ConfigProviderNode',
  'DebugNode',
].concat(OOTB_NODE_TYPES_7_1);

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

async function isCustom(journey) {
  let ootbNodeTypes = [];
  const nodeList = journey.nodes;
  // console.log(nodeList);
  // console.log(storage.session.getAmVersion());
  switch (storage.session.getAmVersion()) {
    case '7.1.0':
      ootbNodeTypes = OOTB_NODE_TYPES_7_1.slice(0);
      break;
    case '7.2.0':
      // console.log("here");
      ootbNodeTypes = OOTB_NODE_TYPES_7_2.slice(0);
      break;
    case '7.0.0':
    case '7.0.1':
    case '7.0.2':
      ootbNodeTypes = OOTB_NODE_TYPES_7.slice(0);
      break;
    case '6.5.3':
    case '6.5.2.3':
    case '6.5.2.2':
    case '6.5.2.1':
    case '6.5.2':
    case '6.5.1':
    case '6.5.0.2':
    case '6.5.0.1':
      ootbNodeTypes = OOTB_NODE_TYPES_6_5.slice(0);
      break;
    case '6.0.0.7':
    case '6.0.0.6':
    case '6.0.0.5':
    case '6.0.0.4':
    case '6.0.0.3':
    case '6.0.0.2':
    case '6.0.0.1':
    case '6.0.0':
      ootbNodeTypes = OOTB_NODE_TYPES_6.slice(0);
      break;
    default:
      return true;
  }
  const results = [];
  for (const node in nodeList) {
    if ({}.hasOwnProperty.call(nodeList, node)) {
      if (!ootbNodeTypes.includes(nodeList[node].nodeType)) {
        return true;
      }
      if (containerNodes.includes(nodeList[node].nodeType)) {
        results.push(getNodeData(node, nodeList[node].nodeType));
      }
    }
  }
  const pageNodes = await Promise.all(results);
  let custom = false;
  pageNodes.forEach((pageNode) => {
    if (pageNode != null) {
      for (const pnode of pageNode.nodes) {
        if (!ootbNodeTypes.includes(pnode.nodeType)) {
          custom = true;
        }
      }
    } else {
      printMessage(
        `isCustom ERROR: can't get ${nodeList[pageNode].nodeType} with id ${pageNode} in ${journey._id}`,
        'error'
      );
      custom = false;
    }
  });
  return custom;
}

export async function listJourneys(analyze) {
  try {
    const urlString = util.format(
      queryAllTreesURLTemplate,
      storage.session.getTenant(),
      getCurrentRealmPath()
    );
    const response = await generateAmApi(getTreeApiConfig()).get(urlString, {
      withCredentials: true,
    });
    if (response.status < 200 || response.status > 399) {
      printMessage(
        `listJourneys ERROR: list journeys call returned ${response.status}, possible cause: invalid credentials`,
        'error'
      );
      return null;
    }
    const journeyList = [];
    if ('result' in response.data) {
      const journeys = response.data.result;
      if (analyze) {
        const results = [];
        for (const journey of journeys) {
          results.push(isCustom(journey));
        }
        const customTrees = await Promise.all(results);
        for (const [i, journey] of journeys.entries()) {
          journeyList.push({ name: journey._id, custom: customTrees[i] });
        }
      } else {
        for (const journey of journeys) {
          journeyList.push({ name: journey._id, custom: false });
        }
      }
    }
    // console.log(journeyList);
    return journeyList;
  } catch (e) {
    printMessage(
      `listJourneys ERROR: error getting journey list - ${e}`,
      'error'
    );
    return null;
  }
}

export async function importAllJourneys(journeyMap, noreuuid) {
  const installedJourneys = (await listJourneys(false)).map((x) => x.name);
  const unresolvedJourneys = [];
  const resolvedJourneys = [];
  await resolveDependencies(
    installedJourneys,
    journeyMap,
    unresolvedJourneys,
    resolvedJourneys
  );
  createProgressBar(resolvedJourneys.length);
  for (const tree of resolvedJourneys) {
    updateProgressBar(`Importing ${tree}`);
    await importJourney(tree, journeyMap[tree], noreuuid);
  }
  stopProgressBar('Done');
}
