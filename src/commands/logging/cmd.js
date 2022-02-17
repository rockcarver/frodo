import { getConnection, saveConnection } from '../../api/AuthApi.js';
import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getSources, tailLogs } from '../../api/LogApi.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const logs = new Command("logs");
    logs
        .addArgument(common.hostArgumentM)
        .helpOption("-h, --help", "Help")
        .description("View Identity Cloud logs.")

    logs
        .command("list")
        .addArgument(common.hostArgumentM)
        .addArgument(common.apiKeyArgument)
        .addArgument(common.apiSecretArgument)
        .helpOption("-h, --help", "Help")
        .description("List available ID Cloud log sources.")
        .action(async (host, key, secret, options, command) => {
            let credsFromParameters = true;
            storage.session.setTenant(host);
            storage.session.setLogApiKey(key);
            storage.session.setLogApiSecret(secret);
            console.log("Listing available ID Cloud log sources...");
            const conn = await getConnection(storage.session.getTenant());
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
        .addArgument(common.hostArgumentM)
        .addArgument(common.apiKeyArgument)
        .addArgument(common.apiSecretArgument)
        .helpOption("-h, --help", "Help")
        .addOption(common.sourcesOptionM)
        .description("Tail Identity Cloud logs.")
        .action(async (host, key, secret, options, command) => {
            let credsFromParameters = true;
            storage.session.setTenant(host);
            storage.session.setLogApiKey(key);
            storage.session.setLogApiSecret(secret);
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