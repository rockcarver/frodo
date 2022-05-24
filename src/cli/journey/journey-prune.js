import yesno from 'yesno';
import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { findOrphanedNodes, removeOrphanedNodes } from '../../api/TreeApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

const program = new Command('frodo journey prune');

program
  .description(
    'Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.'
  )
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .action(
    // implement command logic inside action handler
    async (host, realm, user, password, options) => {
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
        printMessage(`Total nodes:       ${allNodes.length}`, 'info');
        printMessage(`Orphaned nodes:    ${orphanedNodes.length}`, 'info');
        // console.log(orphanedNodes);
        if (orphanedNodes.length > 0) {
          const ok = await yesno({
            question:
              'Do you want to prune (permanently delete) all the orphaned node instances?(y|n):',
          });
          if (ok) {
            printMessage('Pruning.', 'text', false);
            removeOrphanedNodes(allNodes, orphanedNodes);
          }
          printMessage('done', 'text', false);
          printMessage('');
        } else {
          printMessage('No orphaned nodes found.');
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
