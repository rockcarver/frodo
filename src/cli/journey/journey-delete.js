import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { AuthenticateOps, JourneyOps } from '@rockcarver/frodo-lib';
import storage from '../../storage/SessionStorage.js';

const { getTokens } = AuthenticateOps;
const { deleteJourney, deleteJourneys } = JourneyOps;

const program = new Command('frodo journey delete');

program
  .description('Delete journeys/trees.')
  .helpOption('-h, --help', 'Help')
  .showHelpAfterError()
  .addArgument(common.hostArgumentM)
  .addArgument(common.realmArgument)
  .addArgument(common.userArgument)
  .addArgument(common.passwordArgument)
  .addOption(common.deploymentOption)
  .addOption(common.insecureOption)
  .addOption(
    new Option(
      '-i, --journey-id <journey>',
      'Name of a journey/tree. If specified, -a is ignored.'
    )
  )
  .addOption(
    new Option(
      '-a, --all',
      'Delete all the journeys/trees in a realm. Ignored with -i.'
    )
  )
  .addOption(
    new Option(
      '--no-deep',
      'No deep delete. This leaves orphaned configuration artifacts behind.'
    )
  )
  .addOption(
    new Option(
      '--verbose',
      'Verbose output during command execution. If specified, may or may not produce additional output.'
    ).default(false, 'off')
  )
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
        // delete by id
        if (options.journeyId) {
          console.log(
            `Deleting journey ${
              options.journeyId
            } in realm "${storage.session.getRealm()}"...`
          );
          deleteJourney(options.journeyId, options);
        }
        // --all -a
        else if (options.all) {
          console.log('Deleting all journeys...');
          deleteJourneys(options);
        }
        // unrecognized combination of options or no options
        else {
          console.log('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
