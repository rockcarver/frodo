import fs from 'fs';
import { listConnections, saveConnection, getConnectionFileName } from '../../api/AuthApi.js';
import { Command } from 'commander';
import * as common from '../cmd_common.js';

export function setup() {
    const connections = new Command("connections"); 
    connections
        .helpOption("-h, --help", "Help")
        .description("Manage connection profiles.")

    connections
        .command("list")
        .showHelpAfterError()
        .helpOption("-h, --help", "Help")
        .description("List configured connections.")
        .action(async (options, command) => {
            // console.log('list command called');
            listConnections();
        });

    connections
        .command("add")
        .addArgument(common.hostArgumentM)
        .addArgument(common.userArgumentM)
        .addArgument(common.passwordArgumentM)
        .addArgument(common.apiKeyArgument)
        .addArgument(common.apiSecretArgument)
        .showHelpAfterError()
        .helpOption("-h, --help", "Help")
        .description("Add a new connection. You have to specify a URL, username and password at a minimum.\n" +
                    "Optionally, for Identity Cloud, you can also add a log API key and secret.")
        .action(async (host, user, password, key, secret, options, command) => {
            // console.log('list command called');
            saveConnection({
                tenant: host,
                username: user,
                password: password,
                key: key,
                secret: secret
            });
        });

    connections
        .command("delete")
        .addArgument(common.hostArgumentM)
        .showHelpAfterError()
        .helpOption("-h, --help", "Help")
        .description("Delete an existing connection profile (can also be done by editing '$HOME/.frodorc' in a text editor).")
        .action(async (host, options, command) => {
            // console.log('list command called');
            const filename = getConnectionFileName();
            let connectionsData = {};
            fs.stat(filename, function(err, stat) {
                if(err == null) {
                    const data = fs.readFileSync(filename, "utf8");
                    connectionsData = JSON.parse(data);
                    if(connectionsData[host])
                        console.log(`Deleting existing connection profile ${host}`);
                    else
                        console.log(`Connection profile ${host} not found`);
                } else if(err.code === 'ENOENT') {
                    console.log(`Connection profile file ${filename} not found`);
                } else {
                    console.error("Error in deleting connection profile: ", err.code);
                    return;
                }
                delete connectionsData[host];
                fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
                console.log("done.");
            });
        });
    connections.showHelpAfterError();
    return connections;
}
