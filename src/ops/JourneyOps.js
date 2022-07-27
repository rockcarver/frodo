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
import { getRealmManagedUser, replaceAll } from './utils/OpsUtils.js';
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
  deleteTree,
} from '../api/TreeApi.js';
import { getEmailTemplate, putEmailTemplate } from '../api/EmailTemplateApi.js';
import { getScript } from '../api/ScriptApi.js';
import * as global from '../storage/StaticStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
  showSpinner,
  succeedSpinner,
  createTable,
  spinSpinner,
  failSpinner,
  stopSpinner,
  warnSpinner,
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
import {
  decode,
  encode,
  encodeBase64Url,
  isBase64Encoded,
} from '../api/utils/Base64.js';
import {
  getSocialIdentityProviders,
  putProviderByTypeAndId,
} from '../api/SocialIdentityProvidersApi.js';
import { getThemes, putThemes } from '../api/ThemeApi.js';
import { createOrUpdateScript } from './ScriptOps.js';

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

// use a function vs a template variable to avoid problems in loops
function getMultipleTreesFileDataTemplate() {
  return {
    meta: {},
    trees: {},
  };
}

/**
 * Helper to get all SAML2 dependencies for a given node object
 * @param {Object} nodeObject node object
 * @param {[Object]} allProviders array of all saml2 providers objects
 * @param {[Object]} allCirclesOfTrust array of all circle of trust objects
 * @returns {Promise} a promise that resolves to an object containing a saml2 dependencies
 */
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

/**
 * Helper to add all dependencies for a given tree object to the export data
 * @param {Object} treeObject tree object
 * @param {Object} exportData export data
 */
async function exportDependencies(treeObject, exportData, options) {
  const nodePromises = [];
  const scriptPromises = [];
  const emailTemplatePromises = [];
  const innerNodePromises = [];
  const saml2ConfigPromises = [];
  let socialProviderPromise = null;
  const themePromise =
    storage.session.getDeploymentType() !== global.CLASSIC_DEPLOYMENT_TYPE_KEY
      ? getThemes().catch((error) => {
          printMessage(error, 'error');
        })
      : null;

  let allSaml2Providers = null;
  let allCirclesOfTrust = null;
  let filteredSocialProviders = null;
  const themes = [];

  const { useStringArrays } = options.useStringArrays;

  // get all the nodes
  for (const [nodeId, nodeInfo] of Object.entries(treeObject.nodes)) {
    nodePromises.push(
      getNode(nodeId, nodeInfo.nodeType).then((response) => response.data)
    );
  }
  const nodeObjects = await Promise.all(nodePromises);

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
          getEmailTemplate(nodeObject.emailTemplateName).catch((error) => {
            let message = `${error}`;
            if (error.isAxiosError && error.response.status) {
              message = error.response.statusText;
            }
            printMessage(
              `\n${message}: Email Template "${nodeObject.emailTemplateName}"`,
              'error'
            );
          })
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
        innerNodePromises.push(
          getNode(innerNode._id, innerNode.nodeType).then(
            (response) => response.data
          )
        );
      }
      // frodo supports themes in platform deployments
      if (
        storage.session.getDeploymentType() ===
          global.CLOUD_DEPLOYMENT_TYPE_KEY ||
        storage.session.getDeploymentType() ===
          global.FORGEOPS_DEPLOYMENT_TYPE_KEY
      ) {
        let themeId = false;

        if (nodeObject.stage) {
          // see if themeId is part of the stage object
          try {
            themeId = JSON.parse(nodeObject.stage).themeId;
          } catch (e) {
            themeId = false;
          }
          // if the page node's themeId is set the "old way" set themeId accordingly
          if (!themeId && nodeObject.stage.indexOf('themeId=') === 0) {
            // eslint-disable-next-line prefer-destructuring
            themeId = nodeObject.stage.split('=')[1];
          }
        }

        if (themeId) {
          if (!themes.includes(themeId)) themes.push(themeId);
        }
      }
    }
  }

  // Process inner nodes
  const innerNodeDataResults = await Promise.all(innerNodePromises);
  for (const innerNodeObject of innerNodeDataResults) {
    exportData.innerNodes[innerNodeObject._id] = innerNodeObject;

    // handle script node types
    if (scriptedNodes.includes(innerNodeObject._type._id)) {
      scriptPromises.push(getScript(innerNodeObject.script));
    }

    // frodo supports email templates in platform deployments
    if (
      storage.session.getDeploymentType() ===
        global.CLOUD_DEPLOYMENT_TYPE_KEY ||
      storage.session.getDeploymentType() ===
        global.FORGEOPS_DEPLOYMENT_TYPE_KEY
    ) {
      if (emailTemplateNodes.includes(innerNodeObject._type._id)) {
        emailTemplatePromises.push(
          getEmailTemplate(innerNodeObject.emailTemplateName).catch((error) => {
            let message = `${error}`;
            if (error.isAxiosError && error.response.status) {
              message = error.response.statusText;
            }
            printMessage(
              `\n${message}: Email Template "${innerNodeObject.emailTemplateName}"`,
              'error'
            );
          })
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
      innerNodeObject._type._id === 'SelectIdPNode' &&
      innerNodeObject.filteredProviders
    ) {
      filteredSocialProviders = filteredSocialProviders || [];
      for (const filteredProvider of innerNodeObject.filteredProviders) {
        if (!filteredSocialProviders.includes(filteredProvider)) {
          filteredSocialProviders.push(filteredProvider);
        }
      }
    }
  }

  // Process email templates
  const settledEmailTemplatePromises = await Promise.allSettled(
    emailTemplatePromises
  );
  settledEmailTemplatePromises.forEach((settledPromise) => {
    if (settledPromise.status === 'fulfilled' && settledPromise.value) {
      exportData.emailTemplates[settledPromise.value.data._id.split('/')[1]] =
        settledPromise.value.data;
    }
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
          filteredSocialProviders.length === 0 ||
          filteredSocialProviders.includes(socialProvider._id))
      ) {
        scriptPromises.push(getScript(socialProvider.transform));
        exportData.socialIdentityProviders[socialProvider._id] = socialProvider;
      }
    });
  }

  // Process scripts
  const scripts = await Promise.all(scriptPromises);
  scripts.forEach((scriptResultObject) => {
    const scriptObject = _.get(scriptResultObject, 'data');
    if (scriptObject) {
      if (useStringArrays) {
        scriptObject.script = convertBase64TextToArray(scriptObject.script);
      } else {
        scriptObject.script = JSON.stringify(decode(scriptObject.script));
      }
      exportData.scripts[scriptObject._id] = scriptObject;
    }
  });

  // Process themes
  if (themePromise) {
    await Promise.resolve(themePromise).then((themePromiseResults) => {
      themePromiseResults.forEach((themeObject) => {
        if (
          themeObject &&
          // has the theme been specified by id or name in a page node?
          (themes.includes(themeObject._id) ||
            themes.includes(themeObject.name) ||
            // has this journey been linked to a theme?
            themeObject.linkedTrees.includes(treeObject._id))
        ) {
          exportData.themes.push(themeObject);
        }
      });
    });
  }
}

/**
 * Export journey by id/name to file
 * @param {String} journeyId journey id/name
 * @param {String} file optional export file name
 */
export async function exportJourneyToFile(journeyId, file, options) {
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
      try {
        await exportDependencies(treeData, fileData, options);
      } catch (error) {
        printMessage(`Error exporting journey ${journeyId}: ${error}`, 'error');
      }
      saveJsonToFile(fileData, fileName);
      succeedSpinner();
      printMessage(
        `Exported ${journeyId.brightCyan} to ${fileName.brightCyan}.`,
        'info'
      );
    })
    .catch((err) => {
      failSpinner();
      printMessage(err, 'error');
    });
}

/**
 * Get data for journey by id/name
 * @param {String} journeyId journey id/name
 * @returns
 */
export async function getJourneyData(journeyId) {
  showSpinner(`${journeyId}`);
  const journeyData = getSingleTreeFileDataTemplate();
  const treeData = (
    await getTree(journeyId).catch((err) => {
      succeedSpinner();
      printMessage(err, 'error');
    })
  ).data;
  journeyData.tree = treeData;
  spinSpinner();
  await exportDependencies(treeData, journeyData, { useStringArrays: true });
  succeedSpinner();
  return journeyData;
}

/**
 * Export all journeys to file
 * @param {String} file optional export file name
 */
export async function exportJourneysToFile(file, options) {
  let fileName = file;
  if (!fileName) {
    fileName = getTypedFilename(`all${getRealmString()}Journeys`, 'journeys');
  }
  const trees = (await getTrees()).data.result;
  const fileData = getMultipleTreesFileDataTemplate();
  createProgressBar(trees.length, 'Exporting journeys...');
  for (const tree of trees) {
    updateProgressBar(`${tree._id}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      const treeData = (await getTree(tree._id)).data;
      const exportData = getSingleTreeFileDataTemplate();
      delete exportData.meta;
      exportData.tree = treeData;
      // eslint-disable-next-line no-await-in-loop
      await exportDependencies(treeData, exportData, options);
      fileData.trees[tree._id] = exportData;
    } catch (error) {
      printMessage(`Error exporting journey ${tree._id}: ${error}`, 'error');
    }
  }
  saveJsonToFile(fileData, fileName);
  stopProgressBar(`Exported to ${fileName}`);
}

/**
 * Export all journeys to separate files
 */
export async function exportJourneysToFiles(options) {
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
    await exportDependencies(treeData, exportData, options);
    saveJsonToFile(exportData, fileName);
  }
  stopProgressBar('Done');
}

/**
 * Helper to import a tree with all dependencies from an import data object (typically read from a file)
 * @param {Object} treeObject tree object containing tree and all its dependencies
 * @param {Object} options reUuid:boolean: re-uuid all node objects, verbose:boolean: verbose output
 * @returns {String} empty string on success, null otherwise
 */
async function importTree(treeObject, options) {
  const { reUuid } = options;
  const { verbose } = options;
  if (verbose) printMessage(`\n- ${treeObject.tree._id}\n`, 'info', false);
  let newUuid = '';
  const uuidMap = {};
  const treeId = treeObject.tree._id;

  // Process scripts
  if (treeObject.scripts && Object.entries(treeObject.scripts).length > 0) {
    if (verbose) printMessage('  - Scripts:');
    for (const [scriptId, scriptObject] of Object.entries(treeObject.scripts)) {
      if (verbose)
        printMessage(`    - ${scriptId} (${scriptObject.name})`, 'info', false);
      // is the script stored as an array of strings or just b64 blob?
      if (Array.isArray(scriptObject.script)) {
        scriptObject.script = convertTextArrayToBase64(scriptObject.script);
      } else if (!isBase64Encoded(scriptObject.script)) {
        scriptObject.script = encode(JSON.parse(scriptObject.script));
      }
      // eslint-disable-next-line no-await-in-loop
      if ((await createOrUpdateScript(scriptId, scriptObject)) == null) {
        printMessage(
          `importJourney ERROR: error importing script ${scriptObject.name} (${scriptId}) in journey ${treeId}`,
          'error'
        );
        return null;
      }
      if (verbose) printMessage('');
    }
  }

  // Process email templates
  if (
    treeObject.emailTemplates &&
    Object.entries(treeObject.emailTemplates).length > 0
  ) {
    if (verbose) printMessage('  - Email templates:');
    for (const [templateId, templateData] of Object.entries(
      treeObject.emailTemplates
    )) {
      const templateLongId = templateData._id;
      if (verbose) printMessage(`    - ${templateId}`, 'info', false);
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
      if (verbose) printMessage('');
    }
  }

  // Process themes
  if (treeObject.themes && treeObject.themes.length > 0) {
    if (verbose) printMessage('  - Themes:');
    const themes = {};
    for (const theme of treeObject.themes) {
      if (verbose) printMessage(`    - ${theme._id} (${theme.name})`, 'info');
      themes[theme._id] = theme;
    }
    try {
      const result = await putThemes(themes);
      if (result == null) {
        printMessage(
          `Error importing ${Object.keys(themes).length} themes from ${themes}`,
          'error'
        );
      }
    } catch (error) {
      printMessage(`Error importing themes: ${error.message}`, 'error');
    }
  }

  // Process social providers
  if (
    treeObject.socialIdentityProviders &&
    Object.entries(treeObject.socialIdentityProviders).length > 0
  ) {
    if (verbose) printMessage('  - OAuth2/OIDC (social) identity providers:');
    for (const [providerId, providerData] of Object.entries(
      treeObject.socialIdentityProviders
    )) {
      if (verbose) printMessage(`    - ${providerId}`, 'info');
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
  if (
    treeObject.saml2Entities &&
    Object.entries(treeObject.saml2Entities).length > 0
  ) {
    if (verbose) printMessage('  - SAML2 entity providers:');
    for (const [, providerData] of Object.entries(treeObject.saml2Entities)) {
      delete providerData._rev;
      const { entityId } = providerData;
      const { entityLocation } = providerData;
      if (verbose) printMessage(`    - ${entityLocation} ${entityId}`, 'info');
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
  if (
    treeObject.circlesOfTrust &&
    Object.entries(treeObject.circlesOfTrust).length > 0
  ) {
    if (verbose) printMessage('  - SAML2 circles of trust:');
    for (const [cotId, cotData] of Object.entries(treeObject.circlesOfTrust)) {
      delete cotData._rev;
      if (verbose) printMessage(`    - ${cotId}`, 'info');
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
  let innerNodes = {};
  if (
    treeObject.innerNodes &&
    Object.entries(treeObject.innerNodes).length > 0
  ) {
    innerNodes = treeObject.innerNodes;
  }
  // old export file format
  else if (
    treeObject.innernodes &&
    Object.entries(treeObject.innernodes).length > 0
  ) {
    innerNodes = treeObject.innernodes;
  }
  if (Object.entries(innerNodes).length > 0) {
    if (verbose) printMessage('  - Inner nodes:', 'text', true);
    for (const [innerNodeId, innerNodeData] of Object.entries(innerNodes)) {
      delete innerNodeData._rev;
      const nodeType = innerNodeData._type._id;
      if (!reUuid) {
        newUuid = innerNodeId;
      } else {
        newUuid = uuidv4();
        uuidMap[innerNodeId] = newUuid;
      }
      innerNodeData._id = newUuid;

      if (verbose)
        printMessage(
          `    - ${newUuid}${reUuid ? '*' : ''} (${nodeType})`,
          'info',
          false
        );

      // If the node has an identityResource config setting
      // and the identityResource ends in 'user'
      // and the node's identityResource is the same as the tree's identityResource
      // change it to the current realm managed user identityResource otherwise leave it alone.
      if (
        innerNodeData.identityResource &&
        innerNodeData.identityResource.endsWith('user') &&
        innerNodeData.identityResource === treeObject.tree.identityResource
      ) {
        innerNodeData.identityResource = `managed/${getRealmManagedUser()}`;
        if (verbose)
          printMessage(
            `\n      - identityResource: ${innerNodeData.identityResource}`,
            'info',
            false
          );
      }
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
      if (verbose) printMessage('');
    }
  }

  // Process nodes
  if (treeObject.nodes && Object.entries(treeObject.nodes).length > 0) {
    if (verbose) printMessage('  - Nodes:');
    // eslint-disable-next-line prefer-const
    for (let [nodeId, nodeData] of Object.entries(treeObject.nodes)) {
      delete nodeData._rev;
      const nodeType = nodeData._type._id;
      if (!reUuid) {
        newUuid = nodeId;
      } else {
        newUuid = uuidv4();
        uuidMap[nodeId] = newUuid;
      }
      nodeData._id = newUuid;

      if (nodeType === 'PageNode' && reUuid) {
        for (const [, inPageNodeData] of Object.entries(nodeData.nodes)) {
          const currentId = inPageNodeData._id;
          nodeData = JSON.parse(
            replaceAll(JSON.stringify(nodeData), currentId, uuidMap[currentId])
          );
        }
      }

      if (verbose)
        printMessage(
          `    - ${newUuid}${reUuid ? '*' : ''} (${nodeType})`,
          'info',
          false
        );

      // If the node has an identityResource config setting
      // and the identityResource ends in 'user'
      // and the node's identityResource is the same as the tree's identityResource
      // change it to the current realm managed user identityResource otherwise leave it alone.
      if (
        nodeData.identityResource &&
        nodeData.identityResource.endsWith('user') &&
        nodeData.identityResource === treeObject.tree.identityResource
      ) {
        nodeData.identityResource = `managed/${getRealmManagedUser()}`;
        if (verbose)
          printMessage(
            `\n      - identityResource: ${nodeData.identityResource}`,
            'info',
            false
          );
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        await putNode(newUuid, nodeType, nodeData);
      } catch (nodeImportError) {
        printMessage(nodeImportError, 'error');
        printMessage(
          `importJourney ERROR: error importing node ${nodeId}:${newUuid} in journey ${treeId}`,
          'error'
        );
        return null;
      }
      if (verbose) printMessage('');
    }
  }

  // Process tree
  if (verbose) printMessage('  - Flow');

  if (reUuid) {
    let journeyText = JSON.stringify(treeObject.tree, null, 2);
    for (const [oldId, newId] of Object.entries(uuidMap)) {
      journeyText = replaceAll(journeyText, oldId, newId);
    }
    treeObject.tree = JSON.parse(journeyText);
  }

  // If the tree has an identityResource config setting
  // and the identityResource ends in 'user'
  // Set the identityResource for the tree to the selected resource.
  if (
    treeObject.tree.identityResource &&
    treeObject.tree.identityResource.endsWith('user')
  ) {
    treeObject.tree.identityResource = `managed/${getRealmManagedUser()}`;
    if (verbose)
      printMessage(
        `    - identityResource: ${treeObject.tree.identityResource}`,
        'info',
        false
      );
  }

  delete treeObject.tree._rev;
  try {
    await putTree(treeObject.tree._id, treeObject.tree);
    if (verbose) printMessage(`\n    - Done`, 'info', true);
    return '';
  } catch (importError) {
    if (
      importError.response.status === 400 &&
      importError.response.data.message === 'Invalid attribute specified.'
    ) {
      const { validAttributes } = importError.response.data.detail;
      validAttributes.push('_id');
      Object.keys(treeObject.tree).forEach((attribute) => {
        if (!validAttributes.includes(attribute)) {
          if (verbose)
            printMessage(
              `\n    - Removing invalid attribute: ${attribute}`,
              'info',
              false
            );
          delete treeObject.tree[attribute];
        }
      });
      try {
        await putTree(treeObject.tree._id, treeObject.tree);
        if (verbose) printMessage(`\n    - Done`, 'info', true);
        return '';
      } catch (importError2) {
        printMessage(importError2, 'error');
        printMessage(`ERROR: error importing journey flow ${treeId}`, 'error');
        return null;
      }
    } else {
      printMessage(importError, 'error');
      printMessage(`ERROR: error importing journey flow ${treeId}`, 'error');
      return null;
    }
  }
}

/**
 * Import a journey from file
 * @param {String} journeyId journey id/name
 * @param {String} file import file name
 * @param {boolean} options reUuid:boolean: re-uuid all node objects, verbose:boolean: verbose output
 */
export async function importJourneyFromFile(journeyId, file, options) {
  createProgressBar(1, `${journeyId}`);
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    let journeyData = JSON.parse(data);
    // check if this is a file with multiple trees and get journey by id
    if (journeyData.trees && journeyData.trees[journeyId]) {
      journeyData = journeyData.trees[journeyId];
    } else if (journeyData.trees) {
      journeyData = null;
    }
    // if a journeyId was specified, only import the matching journey
    if (journeyData && journeyId === journeyData.tree._id) {
      importTree(journeyData, options)
        .then(() => {
          updateProgressBar();
        })
        .finally(() => {
          stopProgressBar();
        });
    } else {
      stopProgressBar(`${journeyId} not found!`);
    }
  });
}

export async function importFirstJourneyFromFile(file, options) {
  fs.readFile(file, 'utf8', async (err, data) => {
    if (err) throw err;
    let journeyData = _.cloneDeep(JSON.parse(data));
    let journeyId = null;
    // single tree
    if (journeyData.tree) {
      journeyId = _.cloneDeep(journeyData.tree._id);
    }
    // multiple trees, so get the first tree
    else if (journeyData.trees) {
      for (const treeId in journeyData.trees) {
        if (Object.hasOwnProperty.call(journeyData.trees, treeId)) {
          journeyId = treeId;
          journeyData = journeyData.trees[treeId];
          break;
        }
      }
    }
    // if a journeyId was specified, only import the matching journey
    if (journeyData && journeyId) {
      createProgressBar(1, `${journeyId}`);
      importTree(journeyData, options)
        .then(() => {
          updateProgressBar();
          stopProgressBar();
        })
        .catch((importError) => {
          stopProgressBar(`${importError}`);
        });
    } else {
      stopProgressBar(`No journeys found!`);
    }
  });
}

async function resolveDependencies(
  installedJorneys,
  journeyMap,
  unresolvedJourneys,
  resolvedJourneys,
  index = -1
) {
  let before = -1;
  let after = index;
  if (index !== -1) {
    before = index;
  }

  for (const tree in journeyMap) {
    if ({}.hasOwnProperty.call(journeyMap, tree)) {
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
        if (resolvedJourneys.indexOf(tree) === -1) resolvedJourneys.push(tree);
        // remove from unresolvedJourneys array
        // for (let i = 0; i < unresolvedJourneys.length; i += 1) {
        //   if (unresolvedJourneys[i] === tree) {
        //     unresolvedJourneys.splice(i, 1);
        //     i -= 1;
        //   }
        // }
        delete unresolvedJourneys[tree];
        // } else if (!unresolvedJourneys.includes(tree)) {
      } else {
        // unresolvedJourneys.push(tree);
        unresolvedJourneys[tree] = dependencies;
      }
    }
  }
  after = Object.keys(unresolvedJourneys).length;
  if (index !== -1 && after === before) {
    // This is the end, no progress was made since the last recursion
    // printMessage(
    //   `Journeys with unresolved dependencies: ${unresolvedJourneys}`,
    //   'error'
    // );
  } else if (after > 0) {
    resolveDependencies(
      installedJorneys,
      journeyMap,
      unresolvedJourneys,
      resolvedJourneys,
      after
    );
  }
}

/**
 * Helper to import multiple trees from a tree map
 * @param {Object} treesMap map of trees object
 * @param {boolean} options reUuid:boolean: re-uuid all node objects, verbose:boolean: verbose output
 */
async function importAllTrees(treesMap, options) {
  const installedJourneys = (await getTrees()).data.result.map((x) => x._id);
  const unresolvedJourneys = {};
  const resolvedJourneys = [];
  showSpinner('Resolving dependencies');
  await resolveDependencies(
    installedJourneys,
    treesMap,
    unresolvedJourneys,
    resolvedJourneys
  );
  if (Object.keys(unresolvedJourneys).length === 0) {
    succeedSpinner(`Resolved all dependencies.`);
  } else {
    failSpinner(
      `${
        Object.keys(unresolvedJourneys).length
      } journeys with unresolved dependencies:`
    );
    for (const journey of Object.keys(unresolvedJourneys)) {
      printMessage(
        `  - ${journey} requires ${unresolvedJourneys[journey]}`,
        'info'
      );
    }
  }
  createProgressBar(resolvedJourneys.length, 'Importing');
  for (const tree of resolvedJourneys) {
    updateProgressBar(`${tree}`);
    // eslint-disable-next-line no-await-in-loop
    await importTree(treesMap[tree], options);
  }
  stopProgressBar('Done');
}

/**
 * Import all journeys from file
 * @param {*} file import file name
 * @param {boolean} options reUuid:boolean: re-uuid all node objects, verbose:boolean: verbose output
 */
export async function importJourneysFromFile(file, options) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    const fileData = JSON.parse(data);
    importAllTrees(fileData.trees, options);
  });
}

/**
 * Import all journeys from separate files
 * @param {boolean} options reUuid:boolean: re-uuid all node objects, verbose:boolean: verbose output
 */
export async function importJourneysFromFiles(options) {
  const names = fs.readdirSync('.');
  const jsonFiles = names.filter((name) =>
    name.toLowerCase().endsWith('.journey.json')
  );
  const allJourneysData = { trees: {} };
  for (const file of jsonFiles) {
    const journeyData = JSON.parse(fs.readFileSync(file, 'utf8'));
    allJourneysData.trees[journeyData.tree._id] = journeyData;
  }
  importAllTrees(allJourneysData.trees, options);
}

/**
 * Describe a tree
 * @param {Object} treeData tree
 * @returns {Object} an object describing the tree
 */
export function describeTree(treeData) {
  const treeMap = {};
  const nodeTypeMap = {};
  const scriptsMap = {};
  const emailTemplatesMap = {};
  treeMap.treeName = treeData.tree._id;
  for (const [, nodeData] of Object.entries(treeData.nodes)) {
    if (nodeTypeMap[nodeData._type._id]) {
      nodeTypeMap[nodeData._type._id] += 1;
    } else {
      nodeTypeMap[nodeData._type._id] = 1;
    }
  }

  for (const [, nodeData] of Object.entries(treeData.innerNodes)) {
    if (nodeTypeMap[nodeData._type._id]) {
      nodeTypeMap[nodeData._type._id] += 1;
    } else {
      nodeTypeMap[nodeData._type._id] = 1;
    }
  }

  for (const [, scriptData] of Object.entries(treeData.scripts)) {
    scriptsMap[scriptData.name] = scriptData.description;
  }

  for (const [id, data] of Object.entries(treeData.emailTemplates)) {
    emailTemplatesMap[id] = data.displayName;
  }

  treeMap.nodeTypes = nodeTypeMap;
  treeMap.scripts = scriptsMap;
  treeMap.emailTemplates = emailTemplatesMap;
  return treeMap;
}

/**
 * Find all node configuration objects that are no longer referenced by any tree
 */
async function findOrphanedNodes() {
  const allNodes = [];
  const orphanedNodes = [];
  let types = [];
  const allJourneys = (await getTrees()).data.result;
  let errorMessage = '';
  const errorTypes = [];

  showSpinner(`Counting total nodes...`);
  try {
    types = (await getNodeTypes()).data.result;
  } catch (error) {
    printMessage('Error retrieving all available node types:', 'error');
    printMessage(error.response.data, 'error');
    return [];
  }
  for (const type of types) {
    try {
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      (await getNodesByType(type._id)).data.result.forEach((node) => {
        allNodes.push(node);
        spinSpinner(`${allNodes.length} total nodes${errorMessage}`);
      });
    } catch (error) {
      errorTypes.push(type._id);
      errorMessage = ` (Skipped type(s): ${errorTypes})`.yellow;
      spinSpinner(`${allNodes.length} total nodes${errorMessage}`);
    }
  }
  if (errorTypes.length > 0) {
    warnSpinner(`${allNodes.length} total nodes${errorMessage}`);
  } else {
    succeedSpinner(`${allNodes.length} total nodes`);
  }

  showSpinner('Counting active nodes...');
  const activeNodes = [];
  for (const journey of allJourneys) {
    for (const nodeId in journey.nodes) {
      if ({}.hasOwnProperty.call(journey.nodes, nodeId)) {
        activeNodes.push(nodeId);
        spinSpinner(`${activeNodes.length} active nodes`);
        const node = journey.nodes[nodeId];
        if (containerNodes.includes(node.nodeType)) {
          // eslint-disable-next-line no-await-in-loop
          const containerNode = (await getNode(nodeId, node.nodeType)).data;
          containerNode.nodes.forEach((n) => {
            activeNodes.push(n._id);
            spinSpinner(`${activeNodes.length} active nodes`);
          });
        }
      }
    }
  }
  succeedSpinner(`${activeNodes.length} active nodes`);

  showSpinner('Calculating orphaned nodes...');
  const diff = allNodes.filter((x) => !activeNodes.includes(x._id));
  diff.forEach((x) => orphanedNodes.push(x));
  succeedSpinner(`${orphanedNodes.length} orphaned nodes`);
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
  let journeys = [];
  try {
    journeys = (await getTrees()).data.result;
  } catch (error) {
    printMessage(`${error.message}`, 'error');
    printMessage(error.response.data, 'error');
  }
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
      printMessage(`${customTrees[i] ? '*' : ''}${journey._id}`, 'data');
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
    printMessage(table.toString(), 'data');
  }
}

/**
 * Delete a journey
 * @param {String} journeyId journey id/name
 * @param {Object} options deep=true also delete all the nodes and inner nodes, verbose=true print verbose info
 */
export async function deleteJourney(journeyId, options, spinner = true) {
  const { deep } = options;
  const { verbose } = options;
  const status = { nodes: {} };
  if (spinner) showSpinner(`Deleting ${journeyId}...`);
  if (spinner && verbose) stopSpinner();
  return deleteTree(journeyId)
    .then(async (deleteTreeResponse) => {
      status.status = 'success';
      const nodePromises = [];
      if (verbose) printMessage(`Deleted ${journeyId} (tree)`, 'info');
      if (deep) {
        for (const [nodeId, nodeObject] of Object.entries(
          deleteTreeResponse.data.nodes
        )) {
          // delete inner nodes (nodes inside container nodes)
          if (containerNodes.includes(nodeObject.nodeType)) {
            try {
              // eslint-disable-next-line no-await-in-loop
              const pageNode = (await getNode(nodeId, nodeObject.nodeType))
                .data;
              if (verbose)
                printMessage(
                  `Read ${nodeId} (${nodeObject.nodeType}) from ${journeyId}`,
                  'info'
                );
              for (const innerNodeObject of pageNode.nodes) {
                nodePromises.push(
                  deleteNode(innerNodeObject._id, innerNodeObject.nodeType)
                    .then((response2) => {
                      status.nodes[innerNodeObject._id] = { status: 'success' };
                      if (verbose)
                        printMessage(
                          `Deleted ${innerNodeObject._id} (${innerNodeObject.nodeType}) from ${journeyId}`,
                          'info'
                        );
                      return response2.data;
                    })
                    .catch((error) => {
                      status.nodes[innerNodeObject._id] = {
                        status: 'error',
                        error,
                      };
                      if (verbose)
                        printMessage(
                          `Error deleting inner node ${innerNodeObject._id} (${innerNodeObject.nodeType}) from ${journeyId}: ${error}`,
                          'error'
                        );
                    })
                );
              }
              // finally delete the container node
              nodePromises.push(
                deleteNode(nodeId, nodeObject.nodeType)
                  .then((response2) => {
                    status.nodes[nodeId] = { status: 'success' };
                    if (verbose)
                      printMessage(
                        `Deleted ${nodeId} (${nodeObject.nodeType}) from ${journeyId}`,
                        'info'
                      );
                    return response2.data;
                  })
                  .catch((error) => {
                    status.nodes[nodeId] = { status: 'error', error };
                    if (verbose)
                      printMessage(
                        `Error deleting container node ${nodeId} (${nodeObject.nodeType}) from ${journeyId}: ${error}`,
                        'error'
                      );
                  })
              );
            } catch (error) {
              if (verbose)
                printMessage(
                  `Error getting container node ${nodeId} (${nodeObject.nodeType}) from ${journeyId}: ${error}`,
                  'error'
                );
            }
          } else {
            // delete the node
            nodePromises.push(
              deleteNode(nodeId, nodeObject.nodeType)
                .then((response) => {
                  status.nodes[nodeId] = { status: 'success' };
                  if (verbose)
                    printMessage(
                      `Deleted ${nodeId} (${nodeObject.nodeType}) from ${journeyId}`,
                      'info'
                    );
                  return response.data;
                })
                .catch((error) => {
                  status.nodes[nodeId] = { status: 'error', error };
                  if (verbose)
                    printMessage(
                      `Error deleting node ${nodeId} (${nodeObject.nodeType}) from ${journeyId}: ${error}`,
                      'error'
                    );
                })
            );
          }
        }
      }
      // wait until all the node calls are complete
      await Promise.allSettled(nodePromises);

      // report status
      if (spinner) {
        let nodeCount = 0;
        let errorCount = 0;
        for (const node of Object.keys(status.nodes)) {
          nodeCount += 1;
          if (status.nodes[node].status === 'error') errorCount += 1;
        }
        if (errorCount === 0) {
          succeedSpinner(
            `Deleted ${journeyId} and ${
              nodeCount - errorCount
            }/${nodeCount} nodes.`
          );
        } else {
          failSpinner(
            `Deleted ${journeyId} and ${
              nodeCount - errorCount
            }/${nodeCount} nodes.`
          );
        }
      }
      return status;
    })
    .catch((error) => {
      status.status = 'error';
      status.error = error;
      failSpinner(`Error deleting ${journeyId}.`);
      if (verbose)
        printMessage(`Error deleting tree ${journeyId}: ${error}`, 'error');
      return status;
    });
}

/**
 * Delete all journeys
 * @param {Object} options deep=true also delete all the nodes and inner nodes, verbose=true print verbose info
 */
export async function deleteJourneys(options) {
  const { verbose } = options;
  const status = {};
  const trees = (await getTrees()).data.result;
  createProgressBar(trees.length, 'Deleting journeys...');
  for (const tree of trees) {
    if (verbose) printMessage('');
    // eslint-disable-next-line no-await-in-loop
    status[tree._id] = await deleteJourney(tree._id, options, false);
    updateProgressBar(`${tree._id}`);
    // introduce a 100ms wait to allow the progress bar to update before the next verbose message prints from the async function
    if (verbose)
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => {
        setTimeout(r, 100);
      });
  }
  let journeyCount = 0;
  let journeyErrorCount = 0;
  let nodeCount = 0;
  let nodeErrorCount = 0;
  for (const journey of Object.keys(status)) {
    journeyCount += 1;
    if (status[journey].status === 'error') journeyErrorCount += 1;
    for (const node of Object.keys(status[journey].nodes)) {
      nodeCount += 1;
      if (status[journey].nodes[node].status === 'error') nodeErrorCount += 1;
    }
  }
  stopProgressBar(
    `Deleted ${journeyCount - journeyErrorCount}/${journeyCount} journeys and ${
      nodeCount - nodeErrorCount
    }/${nodeCount} nodes.`
  );
  return status;
}
