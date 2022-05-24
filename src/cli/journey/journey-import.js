import fs from 'fs';
import path from 'path';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { importJourney, importAllJourneys } from '../../api/TreeApi.js';
import storage from '../../storage/SessionStorage.js';
import { printMessage } from '../../api/utils/Console.js';

const program = new Command('frodo command sub');

program
  .description('Import journey/tree.')
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
      '-A, --all-separate',
      'Import all the journeys/trees from separate files (*.json) in the current directory. Ignored with -t or -a.'
    )
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
        // import
        if (options.tree) {
          printMessage('Importing journey...');
          fs.readFile(options.file, 'utf8', (err, data) => {
            if (err) throw err;
            const journeyData = JSON.parse(data);
            importJourney(
              options.tree,
              journeyData,
              options.noReUUIDOption
            ).then((result) => {
              if (!result == null) printMessage('Import done.');
            });
          });
        }
        // --all -a
        else if (options.all && options.file) {
          printMessage(
            `Importing all journeys from a single file (${options.file})...`
          );
          fs.readFile(options.file, 'utf8', (err, data) => {
            if (err) throw err;
            const journeyData = JSON.parse(data);
            importAllJourneys(journeyData.trees, options.noReUUIDOption).then(
              (result) => {
                if (!result == null) printMessage('done.');
              }
            );
          });
        }
        // --all-separate -A
        else if (options.allSeparate && !options.file) {
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
              options.noReUUIDOption
            ).then((result) => {
              if (!result == null) printMessage('done.');
            });
          });
        }
        // unrecognized combination of options or no options
        else {
          printMessage('Unrecognized combination of options or no options...');
          program.help();
        }
      }
    }
    // end command logic inside action handler
  );

program.parse();
