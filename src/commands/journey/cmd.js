import fs from 'fs';
import path from 'path';
import yesno from 'yesno';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listJourneys,
  getJourneyData,
  describeTree,
  importJourney,
  importAllJourneys,
  findOrphanedNodes,
  removeOrphanedNodes,
} from '../../api/TreeApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

export default function setup() {
  const journey = new Command('journey')
    .helpOption('-h, --help', 'Help')
    .description('Manage journeys/trees.');

  journey
    .command('list')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option('-a, --analyze', 'Analyze journeys for custom nodes.')
    )
    .description('List all the journeys/trees in a realm.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
            `Listing journeys in realm "${storage.session.getRealm()}"...`
          );  
        const journeyList = await listJourneys(command.opts().analyze);
        journeyList.sort((a, b) => a.name.localeCompare(b.name));
        if (command.opts().analyze) {
          journeyList.forEach((item, index) => {
            printMessage(`${item.name} ${item.custom ? '(*)' : ''}`);
          });
        printMessage('(*) Tree contains custom node(s).');
        } else {
          journeyList.forEach((item, index) => {
            printMessage(`${item.name}`);
          });
        }
      }
    });

  journey
    .command('describe')
    .addArgument(common.hostArgument)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.treeOption)
    .addOption(common.fileOption)
    .addOption(common.versionOption)
    .addOption(common.insecureOption)
    .description(
      'If -h is supplied, describe the journey/tree indicated by -t, or \
all journeys/trees in the realm if no -t is supplied, otherwise \
describe the journey/tree export file indicated by -f.'
    )
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      const treeDescription = [];
      // TODO: review checks for arguments
      if (
        typeof host === 'undefined' ||
        typeof command.opts().file !== 'undefined'
      ) {
        if (typeof command.opts().file === 'undefined') {
          printMessage('You either need <host> or -f when using describe', 'error');
          return;
        }
        printMessage(`Describing local journey file ${command.opts().file}...`);
        try {
          const data = fs.readFileSync(command.opts().file, 'utf8');
          const journeyData = JSON.parse(data);
          treeDescription.push(describeTree(journeyData));
        } catch (err) {
          printMessage(err, 'error');
        }
      } else if (await getTokens()) {
        printMessage(
          `Describing journey(s) in realm "${storage.session.getRealm()}"...`
        );
        if (typeof command.opts().tree === 'undefined') {
          const journeyList = await listJourneys(false);
          for (const item of journeyList) {
            const journeyData = await getJourneyData(item.name);
            treeDescription.push(describeTree(journeyData));
          }
        } else {
          const journeyData = await getJourneyData(command.opts().tree);
          treeDescription.push(describeTree(journeyData));
        }
      }
      for (const item of treeDescription) {
        printMessage(`\nJourney: ${item.treeName}`);
        printMessage('========');
        printMessage('\nNodes:');
        for (const [name, count] of Object.entries(item.nodeTypes)) {
          printMessage(`- ${name}: ${count}`);
        }
        printMessage('\nScripts:');
        for (const [name, desc] of Object.entries(item.scripts)) {
          printMessage(`- ${name}: ${desc}`);
        }
        printMessage('\nEmail Templates:');
        for (const [id, displayName] of Object.entries(item.emailTemplates)) {
          printMessage(`- ${id}`);
        }
      }
    });

  journey
    .command('export')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-t, --tree <tree>',
        'Name of a journey/tree. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to write the exported journey(s) to. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Export all the journeys/trees in a realm. Ignored with -t.'
      )
    )
    .addOption(
      new Option(
        '-A, --allSeparate',
        'Export all the journeys/trees in a realm as separate files <journey/tree name>.json. Ignored with -t or -a.'
      )
    )
    .description('Export journeys/trees.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // export
        if (command.opts().tree) {
          printMessage('Exporting journey...');
          let fileName = `${command.opts().tree}.json`;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          const journeyData = await getJourneyData(command.opts().tree);
          fs.writeFile(
            fileName,
            JSON.stringify(journeyData, null, 2),
            (err, data) => {
              if (err) {
                return printMessage("ERROR - can't save journey to file", 'error');
              }
            }
          );
        }
        // exportAll -a
        else if (command.opts().all) {
          printMessage('Exporting all journeys to a single file...');
          let fileName = 'allJourneys.json';
          const journeysMap = {};
          const topLevelMap = {};
          const journeyList = await listJourneys(false);
          for (const item of journeyList) {
            journeysMap[item.name] = await getJourneyData(item.name);
          }
          topLevelMap.trees = journeysMap;
          if (command.opts().file) {
            fileName = command.opts().file;
          }
          fs.writeFile(
            fileName,
            JSON.stringify(topLevelMap, null, 2),
            (err, data) => {
              if (err) {
                return printMessage("ERROR - can't save journeys to file", 'error');
              }
            }
          );
        }
        // exportAllSeparate -A
        else if (command.opts().allSeparate) {
          printMessage('Exporting all journeys to separate files...');
          const journeyList = await listJourneys(false);
          for (const item of journeyList) {
            const journeyData = await getJourneyData(item.name);
            const fileName = `./${item.name}.json`;
            fs.writeFile(
              fileName,
              JSON.stringify(journeyData, null, 2),
              (err, data) => {
                if (err) {
                  return printMessage(
                    `ERROR - can't save journey ${item.name} to file`,
                    'error'
                  );
                }
              }
            );
          }
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          command.help();
        }
      }
    });

  journey
    .command('import')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-t, --tree <tree>',
        'Name of a journey/tree. If specified, -a and -A are ignored.'
      )
    )
    .addOption(
      new Option(
        '-f, --file <file>',
        'Name of the file to import the journey(s) from. Ignored with -A.'
      )
    )
    .addOption(
      new Option(
        '-a, --all',
        'Import all the journeys/trees from single file. Ignored with -t.'
      )
    )
    .addOption(
      new Option(
        '-A, --allSeparate',
        'Import all the journeys/trees from separate files (*.json) in the current directory. Ignored with -t or -a.'
      )
    )
    .addOption(common.noReUUIDOption)
    .description('Import journey/tree.')
    .action(async (host, realm, user, password, options, command) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        // import
        if (command.opts().tree) {
          printMessage('Importing journey...');
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const journeyData = JSON.parse(data);
            importJourney(
              command.opts().tree,
              journeyData,
              command.opts().noReUUIDOption
            ).then((result) => {
              if (!result == null) printMessage('Import done.');
            });
          });
        }
        // importAll -a
        else if (command.opts().all && command.opts().file) {
          printMessage(
            `Importing all journeys from a single file (${
              command.opts().file
            })...`
          );
          fs.readFile(command.opts().file, 'utf8', (err, data) => {
            if (err) throw err;
            const journeyData = JSON.parse(data);
            importAllJourneys(
              journeyData.trees,
              command.opts().noReUUIDOption
            ).then((result) => {
              if (!result == null) printMessage('done.');
            });
          });
        }
        // importAllSeparate -A
        else if (command.opts().allSeparate && !command.opts().file) {
          printMessage(
            'Importing all journeys from separate files in current directory...'
          );
          const allJourneysData = { trees: {} };
          fs.readdir('.', (err1, files) => {
            const jsonFiles = files.filter(
              (el) => path.extname(el) === '.json'
            );

            jsonFiles.forEach((file) => {
              // console.log(`Importing ${path.parse(file).name}...`);
              allJourneysData.trees[path.parse(file).name] = JSON.parse(
                fs.readFileSync(file, 'utf8')
              );
            });
            importAllJourneys(
              allJourneysData.trees,
              command.opts().noReUUIDOption
            ).then((result) => {
              if (!result == null) printMessage('done.');
            });
          });
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          command.help();
        }
      }
    });

  journey
    .command('prune')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description(
      'Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.'
    )
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        printMessage(
          `Pruning orphaned configuration artifacts in realm "${storage.session.getRealm()}"...`
        );
        const allNodes = [];
        const orphanedNodes = [];
        printMessage(
          'Analyzing authentication nodes configuration artifacts...'
        );
        await findOrphanedNodes(allNodes, orphanedNodes);
        printMessage(`Total nodes:       ${allNodes.length}`);
        printMessage(`Orphaned nodes:    ${orphanedNodes.length}`);
        // console.log(orphanedNodes);
        const ok = await yesno({
          question:
            'Do you want to prune (permanently delete) all the orphaned node instances?(y|n):',
        });
        if (ok) {
          process.stdout.write('Pruning.');
          removeOrphanedNodes(allNodes, orphanedNodes);
        }
        process.stdout.write('done');
        printMessage('');
      }
    });
  journey.showHelpAfterError();
  return journey;
}
