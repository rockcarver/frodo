/* eslint-disable no-param-reassign */
import fs from 'fs';
import yesno from 'yesno';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  convertBase64TextToArray,
  getTypedFilename,
  saveJsonToFile,
  getRealmString,
  convertTextArrayToBase64,
  convertTextArrayToBase64Url,
} from './utils/ExportImportUtils.js';
import { replaceAll } from './utils/OpsUtils.js';
import storage from '../storage/SessionStorage.js';
import {
  getNode,
  putNode,
  deleteNode,
  getTrees,
  getTree,
  putTree,
  getNodeTypes,
  getNodesByType,
} from '../api/TreeApi.js';
import { getEmailTemplate, putEmailTemplate } from '../api/EmailTemplateApi.js';
import { getScript, putScript } from '../api/ScriptApi.js';
import * as global from '../storage/StaticStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
  showSpinner,
  stopSpinner,
  createTable,
  spinSpinner,
} from './utils/Console.js';
import wordwrap from './utils/Wordwrap.js';
import {
  getProviderByLocationAndId,
  getProviders,
  getProviderMetadata,
  createProvider,
  findProviders,
  updateProvider,
} from '../api/Saml2Api.js';
import {
  createCircleOfTrust,
  getCirclesOfTrust,
  updateCircleOfTrust,
} from '../api/CirclesOfTrustApi.js';
import { encodeBase64Url } from '../api/utils/Base64.js';
import {
  getSocialIdentityProviders,
  putProviderByTypeAndId,
} from '../api/SocialIdentityProvidersApi.js';
import { getThemes, putThemes } from '../api/ThemeApi.js';

const containerNodes = ['PageNode', 'CustomPageNode'];

const scriptedNodes = [
  'ConfigProviderNode',
  'ScriptedDecisionNode',
  'ClientScriptNode',
  'SocialProviderHandlerNode',
  'CustomScriptNode',
];

const emailTemplateNodes = ['EmailSuspendNode', 'EmailTemplateNode'];

// use a function vs a template variable to avoid problems in loops
function getSingleTreeFileDataTemplate() {
  return {
    meta: {},
    innerNodes: {},
    nodes: {},
    scripts: {},
    emailTemplates: {},
    socialIdentityProviders: {},
    themes: [],
    saml2Entities: {},
    circlesOfTrust: {},
    tree: {},
  };
}

function getMultipleTreesFileDataTemplate() {
  return {
    meta: {},
    trees: {},
  };
}

async function getSaml2NodeDependencies(
  nodeObject,
  allProviders,
  allCirclesOfTrust
) {
  const samlProperties = ['metaAlias', 'idpEntityId'];
  const saml2EntityPromises = [];
  samlProperties.forEach(async (samlProperty) => {
    // In the following line nodeObject[samlProperty] will look like '/alpha/iSPAzure'.
    const entityId =
      samlProperty === 'metaAlias'
        ? _.last(nodeObject[samlProperty].split('/'))
        : nodeObject[samlProperty];
    const entity = _.find(allProviders, { entityId });
    if (entity) {
      saml2EntityPromises.push(
        getProviderByLocationAndId(entity.location, entity._id).then(
          (providerResponse) => {
            /**
             * Adding entityLocation here to the entityResponse because the import tool
             * needs to know whether the saml2 entity is remote or not (this will be removed
             * from the config before importing see updateSaml2Entity and createSaml2Entity functions).
             * Importing a remote saml2 entity is a slightly different request (see createSaml2Entity).
             */
            providerResponse.data.entityLocation = entity.location;

            if (entity.location === 'remote') {
              // get the xml representation of this entity and add it to the entityResponse;
              return getProviderMetadata(providerResponse.data.entityId).then(
                (metaDataResponse) => {
                  providerResponse.data.base64EntityXML = encodeBase64Url(
                    metaDataResponse.data
                  );
                  return providerResponse;
                }
              );
            }
            return providerResponse;
          }
        )
      );
    }
  });
  return Promise.all(saml2EntityPromises).then(
    (saml2EntitiesPromisesResults) => {
      const saml2Entities = [];
      saml2EntitiesPromisesResults.forEach((saml2Entity) => {
        if (saml2Entity) {
          saml2Entities.push(saml2Entity.data);
        }
      });
      const samlEntityIds = _.map(
        saml2Entities,
        (saml2EntityConfig) => `${saml2EntityConfig.entityId}|saml2`
      );
      const circlesOfTrust = _.filter(allCirclesOfTrust, (circleOfTrust) => {
        let hasEntityId = false;
        circleOfTrust.trustedProviders.forEach((trustedProvider) => {
          if (!hasEntityId && samlEntityIds.includes(trustedProvider)) {
            hasEntityId = true;
          }
        });
        return hasEntityId;
      });
      const saml2NodeDependencies = {
        saml2Entities,
        circlesOfTrust,
      };
      return saml2NodeDependencies;
    }
  );
}

async function exportDependencies(treeObject, exportData) {
  const nodeDataPromises = [];
  const scriptPromises = [];
  const emailTemplatePromises = [];
  const innerNodeDataPromises = [];
  const innerScriptPromises = [];
  const innerEmailTemplatePromises = [];
  const saml2ConfigPromises = [];
  let socialProviderPromise = null;
  const socialIdentityProviderTransFormScriptPromises = [];
  let themePromise = null;

  let allSaml2Providers = null;
  let allCirclesOfTrust = null;
  let filteredSocialProviders = null;
  let themes = null;

  // get all the nodes
  for (const [nodeId, nodeInfo] of Object.entries(treeObject.nodes)) {
    nodeDataPromises.push(
      getNode(nodeId, nodeInfo.nodeType).then((response) => response.data)
    );
  }
  const nodeObjects = await Promise.all(nodeDataPromises);

  // iterate over every node in tree
  for (const nodeObject of nodeObjects) {
    exportData.nodes[nodeObject._id] = nodeObject;

    // handle script node types
    if (scriptedNodes.includes(nodeObject._type._id)) {
      scriptPromises.push(getScript(nodeObject.script));
    }

    // frodo supports email templates in platform deployments
    if (
      storage.session.getDeploymentType() ===
        global.CLOUD_DEPLOYMENT_TYPE_KEY ||
      storage.session.getDeploymentType() ===
        global.FORGEOPS_DEPLOYMENT_TYPE_KEY
    ) {
      if (emailTemplateNodes.includes(nodeObject._type._id)) {
        emailTemplatePromises.push(
          getEmailTemplate(nodeObject.emailTemplateName)
        );
      }
    }

    // handle SAML2 node dependencies
    if (nodeObject._type._id === 'product-Saml2Node') {
      if (!allSaml2Providers) {
        // eslint-disable-next-line no-await-in-loop
        allSaml2Providers = (await getProviders()).data.result;
      }
      if (!allCirclesOfTrust) {
        // eslint-disable-next-line no-await-in-loop
        allCirclesOfTrust = (await getCirclesOfTrust()).data.result;
      }
      saml2ConfigPromises.push(
        getSaml2NodeDependencies(
          nodeObject,
          allSaml2Providers,
          allCirclesOfTrust
        )
      );
    }

    // If this is a SocialProviderHandlerNode get each enabled social identity provider.
    if (
      !socialProviderPromise &&
      nodeObject._type._id === 'SocialProviderHandlerNode'
    ) {
      socialProviderPromise = getSocialIdentityProviders();
    }

    // If this is a SelectIdPNode and filteredProviters is not already set to empty array set filteredSocialProviers.
    if (!filteredSocialProviders && nodeObject._type._id === 'SelectIdPNode') {
      filteredSocialProviders = filteredSocialProviders || [];
      for (const filteredProvider of nodeObject.filteredProviders) {
        if (!filteredSocialProviders.includes(filteredProvider)) {
          filteredSocialProviders.push(filteredProvider);
        }
      }
    }

    // get inner nodes (nodes inside container nodes)
    if (containerNodes.includes(nodeObject._type._id)) {
      for (const innerNode of nodeObject.nodes) {
        innerNodeDataPromises.push(
          getNode(innerNode._id, innerNode.nodeType).then(
            (response) => response.data
          )
        );
      }
      if (nodeObject.stage && nodeObject.stage.indexOf('themeId=') === 0) {
        if (!themePromise) {
          themePromise = getThemes();
        }
        themes = themes || [];
        const themeId = nodeObject.stage.split('=')[1];
        if (!themes.includes(themeId)) themes.push(themeId);
      }
    }
  }

  // Process scripts
  const scripts = await Promise.all(scriptPromises);
  scripts.forEach((scriptObject) => {
    if (scriptObject) {
      scriptObject.script = convertBase64TextToArray(scriptObject.script);
      exportData.scripts[scriptObject._id] = scriptObject;
    }
  });

  // Process email templates
  const emailTemplates = await Promise.all(emailTemplatePromises);
  emailTemplates.forEach((item) => {
    exportData.emailTemplates[item._id.split('/')[1]] = item;
  });

  // Process inner nodes
  const innerNodeDataResults = await Promise.all(innerNodeDataPromises);
  for (const innerNodeObject of innerNodeDataResults) {
    exportData.innerNodes[innerNodeObject._id] = innerNodeObject;

    // handle script node types
    if (scriptedNodes.includes(innerNodeObject._type._id)) {
      innerScriptPromises.push(getScript(innerNodeObject.script));
    }

    // frodo supports email templates in platform deployments
    if (
      storage.session.getDeploymentType() ===
        global.CLOUD_DEPLOYMENT_TYPE_KEY ||
      storage.session.getDeploymentType() ===
        global.FORGEOPS_DEPLOYMENT_TYPE_KEY
    ) {
      if (emailTemplateNodes.includes(innerNodeObject._type._id)) {
        innerEmailTemplatePromises.push(
          getEmailTemplate(innerNodeObject.emailTemplateName)
        );
      }
    }

    // handle SAML2 node dependencies
    if (innerNodeObject._type._id === 'product-Saml2Node') {
      printMessage('SAML2 inner node', 'error');
      if (!allSaml2Providers) {
        // eslint-disable-next-line no-await-in-loop
        allSaml2Providers = (await getProviders()).data.result;
      }
      if (!allCirclesOfTrust) {
        // eslint-disable-next-line no-await-in-loop
        allCirclesOfTrust = (await getCirclesOfTrust()).data.result;
      }
      saml2ConfigPromises.push(
        getSaml2NodeDependencies(
          innerNodeObject,
          allSaml2Providers,
          allCirclesOfTrust
        )
      );
    }

    // If this is a SocialProviderHandlerNode get each enabled social identity provider.
    if (
      !socialProviderPromise &&
      innerNodeObject._type._id === 'SocialProviderHandlerNode'
    ) {
      socialProviderPromise = getSocialIdentityProviders();
    }

    // If this is a SelectIdPNode and filteredProviters is not already set to empty array set filteredSocialProviers.
    if (
      !filteredSocialProviders &&
      innerNodeObject._type._id === 'SelectIdPNode'
    ) {
      filteredSocialProviders = filteredSocialProviders || [];
      for (const filteredProvider of innerNodeObject.filteredProviders) {
        if (!filteredSocialProviders.includes(filteredProvider)) {
          filteredSocialProviders.push(filteredProvider);
        }
      }
    }
  }

  // process inner scripts
  const innerScripts = await Promise.all(innerScriptPromises);
  innerScripts.forEach((scriptObject) => {
    scriptObject.script = convertBase64TextToArray(scriptObject.script);
    exportData.scripts[scriptObject._id] = scriptObject;
  });

  // Process email templates
  const innerEmailTemplates = await Promise.all(innerEmailTemplatePromises);
  innerEmailTemplates.forEach((item) => {
    exportData.emailTemplates[item._id] = item;
  });

  // Process SAML2 providers
  const saml2NodeDependencies = await Promise.all(saml2ConfigPromises);
  saml2NodeDependencies.forEach((saml2NodeDependency) => {
    if (saml2NodeDependency) {
      saml2NodeDependency.saml2Entities.forEach((saml2Entity) => {
        exportData.saml2Entities[saml2Entity._id] = saml2Entity;
      });
      saml2NodeDependency.circlesOfTrust.forEach((circleOfTrust) => {
        exportData.circlesOfTrust[circleOfTrust._id] = circleOfTrust;
      });
    }
  });

  // Process socialIdentityProviders
  const socialProvidersResponse = await Promise.resolve(socialProviderPromise);
  if (socialProvidersResponse) {
    socialProvidersResponse.data.result.forEach((socialProvider) => {
      // If the list of socialIdentityProviders needs to be filtered based on the
      // filteredProviders property of a SelectIdPNode do it here.
      if (
        socialProvider &&
        (!filteredSocialProviders ||
          filteredSocialProviders.includes(socialProvider._id))
      ) {
        socialIdentityProviderTransFormScriptPromises.push(
          getScript(socialProvider.transform)
        );
        exportData.socialIdentityProviders[socialProvider._id] = socialProvider;
      }
    });
    // socialIdentityProvider objects have a "transform" property which refers to a script. Get those scripts here.
    await Promise.all(socialIdentityProviderTransFormScriptPromises).then(
      (socialIdentityProviderTransFormScriptPromiseResults) => {
        socialIdentityProviderTransFormScriptPromiseResults.forEach(
          (scriptObject) => {
            if (scriptObject) {
              // Decode the base64 encoded script text and convert it to an array of strings so it is valid json.
              // The reason for this is to be able to search an export file for text in a script.
              // It will be put back to it's original base64 encoded state upon import.
              scriptObject.script = convertBase64TextToArray(
                scriptObject.script
              );
              // Add each script object to exportData.
              exportData.scripts[scriptObject._id] = scriptObject;
            }
          }
        );
      }
    );
  }

  // Process themes
  if (themes) {
    await Promise.resolve(themePromise).then((themePromiseResults) => {
      themePromiseResults.forEach((themeObject) => {
        if (
          themeObject &&
          (themes.includes(themeObject._id) ||
            themes.includes(themeObject.name))
        ) {
          exportData.themes.push(themeObject);
        }
      });
    });
  }
}

/**
 * Export journey by id/name
 * @param {*} journeyId journey id/name
 * @param {*} file optional export file name
 */
export async function exportJourney(journeyId, file = null) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(journeyId, 'journey');
  }
  showSpinner(`${journeyId}`);
  getTree(journeyId)
    .then(async (response) => {
      const treeData = response.data;
      const fileData = getSingleTreeFileDataTemplate();
      fileData.tree = treeData;
      spinSpinner();
      await exportDependencies(treeData, fileData);
      saveJsonToFile(fileData, fileName);
      stopSpinner();
      printMessage(
        `Exported ${journeyId.brightCyan} to ${fileName.brightCyan}.`,
        'info'
      );
    })
    .catch((err) => {
      stopSpinner();
      printMessage(err, 'error');
    });
}

export async function exportJourneysToFile(file = null) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`all${getRealmString()}Journeys`, 'journey');
  }
  const trees = (await getTrees()).data.result;
  const fileData = getMultipleTreesFileDataTemplate();
  createProgressBar(trees.length, 'Exporting journeys...');
  for (const tree of trees) {
    updateProgressBar(`${tree._id}`);
    // eslint-disable-next-line no-await-in-loop
    const treeData = (await getTree(tree._id)).data;
    const exportData = getSingleTreeFileDataTemplate();
    delete exportData.meta;
    exportData.tree = treeData;
    // eslint-disable-next-line no-await-in-loop
    await exportDependencies(treeData, exportData);
    fileData.trees[tree._id] = exportData;
  }
  saveJsonToFile(fileData, fileName);
  stopProgressBar('Done');
}

export async function exportJourneysToFiles() {
  const trees = (await getTrees()).data.result;
  createProgressBar(trees.length, 'Exporting journeys...');
  for (const tree of trees) {
    updateProgressBar(`${tree._id}`);
    const fileName = getTypedFilename(`${tree._id}`, 'journey');
    // eslint-disable-next-line no-await-in-loop
    const treeData = (await getTree(tree._id)).data;
    const exportData = getSingleTreeFileDataTemplate();
    exportData.tree = treeData;
    // eslint-disable-next-line no-await-in-loop
    await exportDependencies(treeData, exportData);
    saveJsonToFile(exportData, fileName);
  }
  stopProgressBar('Done');
}

async function importDependencies(journeyData, fileData) {}

export async function importTree(id, importData, noreuuid) {
  printMessage(`- ${id}\n`, 'info', false);
  let newUuid = '';
  const uuidMap = {};
  const treeId = importData.tree._id;

  // Process scripts
  if (Object.entries(importData.scripts).length > 0) {
    printMessage('  - Scripts:');
    for (const [scriptId, scriptData] of Object.entries(importData.scripts)) {
      printMessage(`    - ${scriptId} (${scriptData.name})`, 'info', false);
      // is the script stored as an array of strings or just b64 blob?
      if (Array.isArray(scriptData.script)) {
        scriptData.script = convertTextArrayToBase64(scriptData.script);
      }
      // eslint-disable-next-line no-await-in-loop
      if ((await putScript(scriptId, scriptData)) == null) {
        printMessage(
          `importJourney ERROR: error importing script ${scriptData.name} (${scriptId}) in journey ${treeId}`,
          'error'
        );
        return null;
      }
      printMessage('');
    }
  }

  // Process email templates
  if (Object.entries(importData.emailTemplates).length > 0) {
    printMessage('  - Email templates:');
    for (const [templateId, templateData] of Object.entries(
      importData.emailTemplates
    )) {
      const templateLongId = templateData._id;
      printMessage(`    - ${templateId}`, 'info');
      if (
        // eslint-disable-next-line no-await-in-loop
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

  // Process themes
  if (importData.themes.length > 0) {
    printMessage('  - Themes:');
    const themes = {};
    for (const theme of importData.themes) {
      printMessage(`    - ${theme._id} (${theme.name})`, 'info');
      themes[theme._id] = theme;
    }
    await putThemes(themes).then((result) => {
      if (result == null) {
        printMessage(
          `Error importing ${Object.keys(themes).length} themes from ${themes}`,
          'error'
        );
      }
    });
  }

  // Process social providers
  if (Object.entries(importData.socialIdentityProviders).length > 0) {
    printMessage('  - OAuth2/OIDC (social) identity providers:');
    for (const [providerId, providerData] of Object.entries(
      importData.socialIdentityProviders
    )) {
      printMessage(`    - ${providerId}`, 'info');
      if (
        // eslint-disable-next-line no-await-in-loop
        (await putProviderByTypeAndId(
          providerData._type._id,
          providerId,
          providerData
        )) == null
      ) {
        printMessage(
          `importJourney ERROR: error importing provider ${providerId} in journey ${treeId}`,
          'error'
        );
        return null;
      }
    }
  }

  // Process saml providers
  if (Object.entries(importData.saml2Entities).length > 0) {
    printMessage('  - SAML2 entity providers:');
    for (const [, providerData] of Object.entries(importData.saml2Entities)) {
      delete providerData._rev;
      const { entityId } = providerData;
      const { entityLocation } = providerData;
      printMessage(`    - ${entityLocation} ${entityId}`, 'info');
      let metaData = null;
      if (entityLocation === 'remote') {
        if (Array.isArray(providerData.base64EntityXML)) {
          metaData = convertTextArrayToBase64Url(providerData.base64EntityXML);
        } else {
          metaData = providerData.base64EntityXML;
        }
      }
      delete providerData.entityLocation;
      delete providerData.base64EntityXML;
      // create the provider if it doesn't already exist, or just update it
      if (
        // eslint-disable-next-line no-await-in-loop
        (await findProviders(`entityId eq '${entityId}'`, 'location')).data
          .resultCount === 0
      ) {
        // eslint-disable-next-line no-await-in-loop
        await createProvider(entityLocation, providerData, metaData).catch(
          (createProviderErr) => {
            printMessage(`\nError creating provider ${entityId}`, 'error');
            printMessage(createProviderErr.response.data, 'error');
          }
        );
      } else {
        // eslint-disable-next-line no-await-in-loop
        await updateProvider(entityLocation, providerData).catch(
          (updateProviderErr) => {
            printMessage(`\nError updating provider ${entityId}`, 'error');
            printMessage(updateProviderErr.response.data, 'error');
          }
        );
      }
    }
  }

  // Process circles of trust
  if (Object.entries(importData.circlesOfTrust).length > 0) {
    printMessage('  - SAML2 circles of trust:');
    for (const [cotId, cotData] of Object.entries(importData.circlesOfTrust)) {
      delete cotData._rev;
      printMessage(`    - ${cotId}`, 'info');
      // eslint-disable-next-line no-await-in-loop
      await createCircleOfTrust(cotData)
        // eslint-disable-next-line no-unused-vars
        .catch(async (createCotErr) => {
          if (
            createCotErr.response.status === 409 ||
            createCotErr.response.status === 500
          ) {
            await updateCircleOfTrust(cotId, cotData).catch(
              async (updateCotErr) => {
                printMessage(
                  `\nError creating/updating circle of trust ${cotId}`,
                  'error'
                );
                printMessage(createCotErr.response.data, 'error');
                printMessage(updateCotErr.response.data, 'error');
              }
            );
          } else {
            printMessage(`\nError creating circle of trust ${cotId}`, 'error');
            printMessage(createCotErr.response.data, 'error');
          }
        });
    }
  }

  // Process inner nodes
  if (Object.entries(importData.innerNodes).length > 0) {
    printMessage('  - Inner nodes:');
    for (const [innerNodeId, innerNodeData] of Object.entries(
      importData.innerNodes
    )) {
      delete innerNodeData._rev;
      const nodeType = innerNodeData._type._id;
      if (noreuuid) {
        newUuid = innerNodeId;
      } else {
        newUuid = uuidv4();
        uuidMap[innerNodeId] = newUuid;
      }
      innerNodeData._id = newUuid;

      printMessage(`    - ${newUuid} (${nodeType})`, 'info', false);
      try {
        // eslint-disable-next-line no-await-in-loop
        await putNode(newUuid, nodeType, innerNodeData);
      } catch (nodeImportError) {
        printMessage(nodeImportError, 'error');
        printMessage(
          `importJourney ERROR: error importing inner node ${innerNodeId}:${newUuid} in journey ${treeId}`,
          'error'
        );
        return null;
      }
      printMessage('');
    }
  }

  // Process nodes
  printMessage('  - Nodes:');
  // eslint-disable-next-line prefer-const
  for (let [nodeId, nodeData] of Object.entries(importData.nodes)) {
    delete nodeData._rev;
    const nodeType = nodeData._type._id;
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

    printMessage(`    - ${newUuid} (${nodeType})`, 'info', false);
    try {
      // eslint-disable-next-line no-await-in-loop
      await putNode(newUuid, nodeType, nodeData);
    } catch (nodeImportError) {
      printMessage(
        `importJourney ERROR: error importing node ${nodeId}:${newUuid} in journey ${treeId}`,
        'error'
      );
      return null;
    }
    printMessage('');
  }

  // Process tree
  printMessage('  - Flow');
  // eslint-disable-next-line no-param-reassign
  importData.tree._id = id;
  let journeyText = JSON.stringify(importData.tree, null, 2);
  if (!noreuuid) {
    for (const [oldId, newId] of Object.entries(uuidMap)) {
      journeyText = replaceAll(journeyText, oldId, newId);
    }
  }
  const journeyData = JSON.parse(journeyText);
  delete journeyData._rev;
  printMessage(`    - Done`, 'info', false);
  try {
    await putTree(id, journeyData);
    return '';
  } catch (importError) {
    printMessage(`ERROR: error importing journey flow ${treeId}`, 'error');
    return null;
  }
}

export async function importJourney(id, file, noreuuid) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const journeyData = JSON.parse(data);
    importTree(id, journeyData, noreuuid).then((result) => {
      if (!result == null) printMessage('Import done.');
    });
  });
}

export async function importJourneysFromFile(file = null) {}

export async function importJourneysFromFiles() {}

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

/**
 * Find all node configuration objects that are no longer referenced by any tree
 */
async function findOrphanedNodes() {
  const allNodes = [];
  const orphanedNodes = [];
  const allJourneys = (await getTrees()).data.result;

  showSpinner(`Counting total nodes...`);
  const types = (await getNodeTypes()).data.result;
  for (const type of types) {
    // eslint-disable-next-line no-await-in-loop
    (await getNodesByType(type._id)).data.result.forEach((node) => {
      spinSpinner();
      allNodes.push(node);
    });
  }
  stopSpinner(`${allNodes.length} total nodes`);

  showSpinner('Counting active nodes...');
  const activeNodes = [];
  for (const journey of allJourneys) {
    // allJourneys.forEach(async (journey) => {
    for (const nodeId in journey.nodes) {
      if ({}.hasOwnProperty.call(journey.nodes, nodeId)) {
        spinSpinner();
        activeNodes.push(nodeId);
        const node = journey.nodes[nodeId];
        if (containerNodes.includes(node.nodeType)) {
          // eslint-disable-next-line no-await-in-loop
          const containerNode = (await getNode(nodeId, node.nodeType)).data;
          containerNode.nodes.forEach((n) => {
            activeNodes.push(n._id);
          });
        }
      }
    }
  }
  stopSpinner(`${activeNodes.length} active nodes`);

  showSpinner('Calculating orphaned nodes...');
  const diff = allNodes.filter((x) => !activeNodes.includes(x._id));
  diff.forEach((x) => orphanedNodes.push(x));
  stopSpinner(`${orphanedNodes.length} orphaned nodes`);
  return orphanedNodes;
}

/**
 * Remove orphaned nodes
 * @param {[Object]} orphanedNodes Pass in an array of orphaned node configuration objects to remove
 */
async function removeOrphanedNodes(orphanedNodes) {
  createProgressBar(orphanedNodes.length, 'Removing orphaned nodes...');
  for (const node of orphanedNodes) {
    updateProgressBar(`Removing ${node._id}...`);
    // eslint-disable-next-line no-await-in-loop
    await deleteNode(node._id, node._type._id).catch((deleteError) => {
      printMessage(`${deleteError}`, 'error');
    });
  }
  stopProgressBar(`Removed ${orphanedNodes.length} orphaned nodes.`);
}

/**
 * Prune orphaned nodes
 */
export async function prune() {
  const orphanedNodes = await findOrphanedNodes();
  if (orphanedNodes.length > 0) {
    const ok = await yesno({
      question: 'Prune (permanently delete) orphaned nodes? (y|n):',
    });
    if (ok) {
      await removeOrphanedNodes(orphanedNodes);
    }
  } else {
    printMessage('No orphaned nodes found.');
  }
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

/**
 * Analyze if a journey contains any custom nodes considering the detected or the overridden version.
 * @param {Object} journey Journey/tree configuration object
 * @returns {boolean} True if the journey/tree contains any custom nodes, false otherwise.
 */
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
        results.push(
          // eslint-disable-next-line no-await-in-loop
          (await getNode(node, nodeList[node].nodeType)).then(
            (response) => response.data
          )
        );
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

/**
 * List all the journeys/trees
 * @param {boolean} long Long version, all the fields
 * @param {boolean} analyze Analyze journeys/trees for custom nodes (expensive)
 */
export async function listJourneys(long = false, analyze = false) {
  const journeys = (await getTrees()).data.result;
  journeys.sort((a, b) => a._id.localeCompare(b._id));
  let customTrees = Array(journeys.length).fill(false);
  if (analyze) {
    const results = [];
    for (const journey of journeys) {
      results.push(isCustom(journey));
    }
    customTrees = await Promise.all(results);
  }
  if (!long) {
    for (const [i, journey] of journeys.entries()) {
      printMessage(`${customTrees[i] ? ')' : ''}${journey._id}`, 'data');
    }
  } else {
    const table = createTable([
      'Name'.brightCyan,
      'Status'.brightCyan,
      'Tags'.brightCyan,
    ]);
    journeys.forEach((journey, i) => {
      table.push([
        `${customTrees[i] ? '*'.brightRed : ''}${journey._id}`,
        journey.enabled === false
          ? 'disabled'.brightRed
          : 'enabled'.brightGreen,
        journey.uiConfig && journey.uiConfig.categories
          ? wordwrap(JSON.parse(journey.uiConfig.categories).join(', '), 60)
          : '',
      ]);
    });
    printMessage(table.toString());
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
    // eslint-disable-next-line no-await-in-loop
    await importJourney(tree, journeyMap[tree], noreuuid);
  }
  stopProgressBar('Done');
}
