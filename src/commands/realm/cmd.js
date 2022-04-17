/* eslint-disable no-param-reassign */
import { Command, Option } from 'commander';
import Table from 'cli-table3';
import * as colors from '@colors/colors';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import {
  listRealms,
  getRealmByName,
  addCustomDomain,
  removeCustomDomain,
} from '../../api/RealmApi.js';
import storage from '../../storage/SessionStorage.js';

export default function setup() {
  const journey = new Command('realm')
    .helpOption('-h, --help', 'Help')
    .description('Manage realms.');

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
      new Option('-l, --long', 'Long with all fields.').default(false, 'false')
    )
    .description('List all realms.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log('Listing all realms...');
        const realms = await listRealms();
        if (options.long) {
          const table = new Table({
            head: [
              'Name'.brightCyan,
              'Status'.brightCyan,
              'Custom Domains'.brightCyan,
              'Parent'.brightCyan,
            ],
            chars: {
              top: '',
              'top-mid': '',
              'top-left': '',
              'top-right': '',
              bottom: '',
              'bottom-mid': '',
              'bottom-left': '',
              'bottom-right': '',
              left: '',
              'left-mid': '',
              mid: '',
              'mid-mid': '',
              right: '',
              'right-mid': '',
            },
            style: { 'padding-left': 0, 'padding-right': 0 },
          });
          realms.forEach((realmConfig) => {
            table.push([
              realmConfig.name,
              realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
              realmConfig.aliases.join('\n'),
              realmConfig.parentPath,
            ]);
          });
          console.log(table.toString());
        } else {
          realms.forEach((realmConfig) => {
            console.log(realmConfig.name);
          });
        }
      }
    });

  journey
    .command('details')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .description('Show details of a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Retrieving details of realm ${storage.session.getRealm()}...`
        );
        const realmConfig = await getRealmByName(storage.session.getRealm());
        if (realmConfig != null) {
          const table = new Table({
            chars: {
              top: '',
              'top-mid': '',
              'top-left': '',
              'top-right': '',
              bottom: '',
              'bottom-mid': '',
              'bottom-left': '',
              'bottom-right': '',
              left: '',
              'left-mid': '',
              mid: '',
              'mid-mid': '',
              right: '',
              'right-mid': '',
            },
            style: { 'padding-left': 0, 'padding-right': 0 },
            wordWrap: true,
          });
          table.push(['Name'.brightCyan, realmConfig.name]);
          table.push([
            'Status'.brightCyan,
            realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
          ]);
          table.push([
            'Custom Domains'.brightCyan,
            realmConfig.aliases.join('\n'),
          ]);
          table.push(['Parent'.brightCyan, realmConfig.parentPath]);
          table.push(['Id'.brightCyan, realmConfig._id]);
          console.log(table.toString());
        } else {
          console.log(`No realm found with name ${options.target}`);
        }
      }
    });

  journey
    .command('add-custom-domain')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-d, --domain <name>',
        'Custom DNS domain name.'
      ).makeOptionMandatory()
    )
    .description('Add custom DNS domain to a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Adding custom DNS domain ${
            options.domain
          } to realm ${storage.session.getRealm()}...`
        );
        const realmConfig = await addCustomDomain(
          storage.session.getRealm(),
          options.domain
        );
        if (realmConfig != null) {
          const table = new Table({
            chars: {
              top: '',
              'top-mid': '',
              'top-left': '',
              'top-right': '',
              bottom: '',
              'bottom-mid': '',
              'bottom-left': '',
              'bottom-right': '',
              left: '',
              'left-mid': '',
              mid: '',
              'mid-mid': '',
              right: '',
              'right-mid': '',
            },
            style: { 'padding-left': 0, 'padding-right': 0 },
            wordWrap: true,
          });
          table.push(['Name'.brightCyan, realmConfig.name]);
          table.push([
            'Status'.brightCyan,
            realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
          ]);
          table.push([
            'Custom Domains'.brightCyan,
            realmConfig.aliases.join('\n'),
          ]);
          table.push(['Parent'.brightCyan, realmConfig.parentPath]);
          table.push(['Id'.brightCyan, realmConfig._id]);
          console.log(table.toString());
        } else {
          console.log(`No realm found with name ${options.target}`);
        }
      }
    });

  journey
    .command('remove-custom-domain')
    .addArgument(common.hostArgumentM)
    .addArgument(common.realmArgument)
    .addArgument(common.userArgument)
    .addArgument(common.passwordArgument)
    .helpOption('-h, --help', 'Help')
    .addOption(common.deploymentOption)
    .addOption(common.insecureOption)
    .addOption(
      new Option(
        '-d, --domain <name>',
        'Custom DNS domain name.'
      ).makeOptionMandatory()
    )
    .description('Remove custom DNS domain from a realm.')
    .action(async (host, realm, user, password, options) => {
      storage.session.setTenant(host);
      storage.session.setRealm(realm);
      storage.session.setUsername(user);
      storage.session.setPassword(password);
      storage.session.setDeploymentType(options.type);
      storage.session.setAllowInsecureConnection(options.insecure);
      if (await getTokens()) {
        console.log(
          `Removing custom DNS domain ${
            options.domain
          } from realm ${storage.session.getRealm()}...`
        );
        const realmConfig = await removeCustomDomain(
          storage.session.getRealm(),
          options.domain
        );
        if (realmConfig != null) {
          const table = new Table({
            chars: {
              top: '',
              'top-mid': '',
              'top-left': '',
              'top-right': '',
              bottom: '',
              'bottom-mid': '',
              'bottom-left': '',
              'bottom-right': '',
              left: '',
              'left-mid': '',
              mid: '',
              'mid-mid': '',
              right: '',
              'right-mid': '',
            },
            style: { 'padding-left': 0, 'padding-right': 0 },
            wordWrap: true,
          });
          table.push(['Name'.brightCyan, realmConfig.name]);
          table.push([
            'Status'.brightCyan,
            realmConfig.active ? 'active'.brightGreen : 'inactive'.brightRed,
          ]);
          table.push([
            'Custom Domains'.brightCyan,
            realmConfig.aliases.join('\n'),
          ]);
          table.push(['Parent'.brightCyan, realmConfig.parentPath]);
          table.push(['Id'.brightCyan, realmConfig._id]);
          console.log(table.toString());
        } else {
          console.log(`No realm found with name ${options.target}`);
        }
      }
    });

  journey.showHelpAfterError();
  return journey;
}
