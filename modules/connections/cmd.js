const fs = require("fs")

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
            try {
                const data = fs.readFileSync("./connections.json", 'utf8');
                const connectionsData = JSON.parse(data);
                console.log(`[Host] : [Username]`);
                for(c in connectionsData) {
                    console.log(`- [${c}] : [${connectionsData[c].username}]`);
                }
            } catch(e) {
                console.error("No connections found in ./connections.json");
            }
        });

    connections
        .command("add")
        .showHelpAfterError()
        .addOption(common.hostOptionM)
        .addOption(common.userOptionM)
        .addOption(common.passwordOptionM)
        .helpOption("-l, --help", "Help")
        .description("Add a new ForgeRock connection")
        .action(async (options, command) => {
            // console.log('list command called');
            let connectionsData = {};
            fs.stat("./connections.json", function(err, stat) {
                if(err == null) {
                    const data = fs.readFileSync("./connections.json", 'utf8');
                    connectionsData = JSON.parse(data);
                    if(connectionsData[command.opts().host])
                        console.log(`Updating existing connection profile ${command.opts().host}`);
                    else
                        console.log(`Adding connection profile ${command.opts().host}`);    
                } else if(err.code === 'ENOENT') {
                    console.log(`Creating connection profile file ./connections.json with ${command.opts().host}`);
                } else {
                    console.error("Error in adding connection profile: ", err.code);
                    return;
                }
                connectionsData[command.opts().host] = {
                    username: command.opts().user,
                    password: command.opts().password
                };
                fs.writeFileSync("./connections.json", JSON.stringify(connectionsData, null, 2));
                console.log("done.");
            });
        });

    connections
        .command("delete")
        .showHelpAfterError()
        .addOption(common.hostOptionM)
        .helpOption("-l, --help", "Help")
        .description("Delete an existing ForgeRock connection (can also be done by editing ./connections.json in a text editor)")
        .action(async (options, command) => {
            // console.log('list command called');
            let connectionsData = {};
            fs.stat("./connections.json", function(err, stat) {
                if(err == null) {
                    const data = fs.readFileSync("./connections.json", 'utf8');
                    connectionsData = JSON.parse(data);
                    if(connectionsData[command.opts().host])
                        console.log(`Deleting existing connection profile ${command.opts().host}`);
                    else
                        console.log(`Connection profile ${command.opts().host} not found`);
                } else if(err.code === 'ENOENT') {
                    console.log(`Connection profile file ./connections.json not found`);
                } else {
                    console.error("Error in deleting connection profile: ", err.code);
                    return;
                }
                delete connectionsData[command.opts().host];
                fs.writeFileSync("./connections.json", JSON.stringify(connectionsData, null, 2));
                console.log("done.");
            });
        });
    connections.showHelpAfterError();
    return connections;
}
module.exports.Setup = Setup;
