import { getConnection, saveConnection } from '../../api/AuthApi.js';
import { Command } from 'commander';
import common from '../cmd_common.js';
import { getSources, tailLogs } from '../../api/LogApi.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const logs = new Command("logs");
    logs
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOptionM)
        .addOption(common.apiKeyOption)
        .addOption(common.apiSecretOption)
        .description("Get/display/save ForgeRock ID Cloud logs")

    logs
        .command("list")
        .helpOption("-l, --help", "Help")
        .description("List available ID Cloud log sources.")
        .action(async (options, command) => {
            let credsFromParameters = true;
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setLogApiKey(command.parent.opts().key);
            storage.session.setLogApiSecret(command.parent.opts().secret);
            console.log("Listing available ID Cloud log sources...");
            const conn = getConnection(storage.session.getTenant());
            storage.session.setTenant(conn.tenant);
            if (!storage.session.getLogApiKey() && !storage.session.getLogApiSecret()) {
                credsFromParameters = false;
                if (conn.key == null && conn.secret == null) {
                    console.log("API key and secret not specified as parameters and no saved values found!");
                    return;
                }
                storage.session.setLogApiKey(conn.key);
                storage.session.setLogApiSecret(conn.secret);
            }
            let sources = await getSources();
            if (!sources) {
                console.log("Can't get sources, possible cause - wrong API key or secret");
            } else {
                if (credsFromParameters) await saveConnection(); // save new values if they were specified on CLI
                console.log("Available log sources:");
                sources.result.forEach(source => {
                    console.log(`${source}`);
                });
                console.log("You can use any combination of comma separated sources.");
            }
        });

    logs
        .command("tail")
        .helpOption("-l, --help", "Help")
        .addOption(common.sourcesOption)
        // .addOption(common.fileOption.makeOptionMandatory())
        .description("\"tail\" (similar to the \"tail -f\" command) ID Cloud logs")
        .action(async (options, command) => {
            let credsFromParameters = true;
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setLogApiKey(command.parent.opts().key);
            storage.session.setLogApiSecret(command.parent.opts().secret);
            console.log(`Tailing ID Cloud logs from the following sources: ${command.opts().sources}...`);
            const conn = getConnection(storage.session.getTenant());
            storage.session.setTenant(conn.tenant);
            if (!storage.session.getLogApiKey() && !storage.session.getLogApiSecret()) {
                credsFromParameters = false;
                if (conn.key == null && conn.secret == null) {
                    console.log("API key and secret not specified as parameters and no saved values found!");
                    return;
                }
                storage.session.setLogApiKey(conn.key);
                storage.session.setLogApiSecret(conn.secret);
            }
            await tailLogs(command.opts().sources, null);
        });

    // logs
    //     .command("get")
    //     .helpOption("-l, --help", "Help")
    //     .addOption(common.dirOptionM)
    //     .description("Get ID Cloud logs for a give time period (max age 30 days)")
    //     .action(async (options, command) => {
    //         // implement
    //     });

    logs.showHelpAfterError();
    return logs;
}