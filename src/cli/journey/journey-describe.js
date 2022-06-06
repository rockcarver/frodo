import fs from 'fs';
import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listJourneys,
  getJourneyData,
  describeTree,
} from '../../ops/JourneyOps.js';
import storage from '../../storage/SessionStorage.js';
import {
  printMessage,
  createProgressBar,
  updateProgressBar,
  stopProgressBar,
} from '../../ops/utils/Console.js';

const program = new Command('frodo command sub');

program
  .description(
    'If -h is supplied, describe the journey/tree indicated by -t, or all journeys/trees in the realm if no -t is supplied, otherwise describe the journey/tree export file indicated by -f.'
  )
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(common.treeOption)
  .addOption(common.fileOption)
  .addOption(common.versionOption)
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      const treeDescription = [];
      // TODO: review checks for arguments
      if (typeof host === 'undefined' || typeof options.file !== 'undefined') {
        if (typeof options.file === 'undefined') {
          printMessage(
            'You either need <host> or -f when using describe',
            'error'
          );
          return;
        }
        printMessage(`Describing local journey file ${options.file}...`);
        try {
          const data = fs.readFileSync(options.file, 'utf8');
          const journeyData = JSON.parse(data);
          treeDescription.push(describeTree(journeyData));
        } catch (err) {
          printMessage(err, 'error');
        }
      } else if (await getTokens()) {
        printMessage(
          `Describing journey(s) in realm "${storage.session.getRealm()}"...`
        );
        if (typeof options.tree === 'undefined') {
          const journeyList = await listJourneys(false);
          createProgressBar(journeyList.length, '');
          for (const item of journeyList) {
            // eslint-disable-next-line no-await-in-loop
            const journeyData = await getJourneyData(item.name);
            treeDescription.push(describeTree(journeyData));
            updateProgressBar(`Analyzing journey - ${item.name}`);
          }
          stopProgressBar('Done');
        } else {
          const journeyData = await getJourneyData(options.tree);
          treeDescription.push(describeTree(journeyData));
        }
      }
      for (const item of treeDescription) {
        printMessage(`\nJourney: ${item.treeName}`, 'info');
        printMessage('========');
        printMessage('\nNodes:', 'info');
        if (Object.entries(item.nodeTypes).length) {
          for (const [name, count] of Object.entries(item.nodeTypes)) {
            printMessage(`- ${name}: ${count}`, 'info');
          }
        }
        if (Object.entries(item.scripts).length) {
          printMessage('\nScripts:', 'info');
          for (const [name, desc] of Object.entries(item.scripts)) {
            printMessage(`- ${name}: ${desc}`, 'info');
          }
        }
        if (Object.entries(item.emailTemplates).length) {
          printMessage('\nEmail Templates:', 'info');
          for (const [id] of Object.entries(item.emailTemplates)) {
            printMessage(`- ${id}`, 'info');
          }
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
