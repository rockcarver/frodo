const fs = require("fs")
const utils = require('../../utils.js')

const {
    Command
} = require("commander");

const common = require("../cmd_common.js");

const {
    GetTokens
} = require("../../auth.js")

function Setup() {
    const connections = new Command("connections"); 
    connections
        .helpOption("-l, --help", "Help")
        .description("Manage ForgeRock connection profiles")

    connections
        .command("list")
        .showHelpAfterError()
        .helpOption("-l, --help", "Help")
        .description("List configured ForgeRock connections")
        .action(async (options, command) => {
            // console.log('list command called');
            utils.ListConnections();
        });

    connections
        .command("add")
        .showHelpAfterError()
        .addOption(common.hostOptionM)
        .addOption(common.userOptionM)
        .addOption(common.passwordOptionM)
        .addOption(common.apiKeyOption)
        .addOption(common.apiSecretOption)
        .helpOption("-l, --help", "Help")
        .description("Add a new ForgeRock connection. You have to specify a URL, username and password at a minimum.\n" +
                    "Optionally, for ForgeRock ID Cloud, you can also add a log API key and secret")
        .action(async (options, command) => {
            // console.log('list command called');
            utils.SaveConnection({
                tenant: command.opts().host,
                username: command.opts().user,
                password: command.opts().password,
                key: command.opts().key,
                secret: command.opts().secret
            });
        });

    connections
        .command("delete")
        .showHelpAfterError()
        .addOption(common.hostOptionM)
        .helpOption("-l, --help", "Help")
        .description("Delete an existing ForgeRock connection (can also be done by editing '$HOME/.frodorc' in a text editor)")
        .action(async (options, command) => {
            // console.log('list command called');
            const filename = utils.GetConnectionFileName();
            let connectionsData = {};
            fs.stat(filename, function(err, stat) {
                if(err == null) {
                    const data = fs.readFileSync(filename, "utf8");
                    connectionsData = JSON.parse(data);
                    if(connectionsData[command.opts().host])
                        console.log(`Deleting existing connection profile ${command.opts().host}`);
                    else
                        console.log(`Connection profile ${command.opts().host} not found`);
                } else if(err.code === 'ENOENT') {
                    console.log(`Connection profile file ${filename} not found`);
                } else {
                    console.error("Error in deleting connection profile: ", err.code);
                    return;
                }
                delete connectionsData[command.opts().host];
                fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
                console.log("done.");
            });
        });
    connections.showHelpAfterError();
    return connections;
}
module.exports.Setup = Setup;
