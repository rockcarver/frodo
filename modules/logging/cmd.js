const replaceall = require("replaceall");
const fs = require("fs");
const fse = require("fs-extra");
const utils = require('../../utils.js');
const {
    Command
} = require("commander");

const common = require("../cmd_common.js");

const {
    GetTokens
} = require("../../auth.js")

const run = require("./run.js");

function Setup() {
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
        .description("List all ID Cloud logging sources")
        .action(async (options, command) => {
            // console.log('list command called');
            let apiToken = {};
            let credsFromParameters = true;
            apiToken.key = command.parent.opts().key;
            apiToken.secret = command.parent.opts().secret;
            apiToken.tenant = command.parent.opts().host;
            // console.log(apiToken);
            if (!apiToken.key && !apiToken.secret) {
                credsFromParameters = false;
                const conn = utils.GetConnection(apiToken.tenant);
                if (conn.key == null && conn.secret == null) {
                    console.log("API key and secret not specified as parameters and no saved values found!");
                    return;
                }
                apiToken.tenant = conn.tenant;
                apiToken.key = conn.key;
                apiToken.secret = conn.secret;
            }
            let sources = await run.GetSources(apiToken);
            if (!sources) {
                console.log("Can't get sources, possible cause - wrong API key or secret");
            } else {
                if (credsFromParameters) await utils.SaveConnection(apiToken); // save new values if they were specified on CLI
                console.log(`Available log sources: [${sources.result}]`);
                console.log("You can use any combination of comma seprated values");
            }
        });

    logs
        .command("tail")
        .helpOption("-l, --help", "Help")
        .addOption(common.sourcesOption)
        // .addOption(common.fileOption.makeOptionMandatory())
        .description("\"tail\" (similar to the \"tail -f\" command) ID Cloud logs")
        .action(async (options, command) => {
            // console.log('list command called');
            let apiToken = {};
            apiToken.key = command.parent.opts().key;
            apiToken.secret = command.parent.opts().secret;
            apiToken.tenant = command.parent.opts().host;

            // console.log(command.opts());

            if (apiToken.key == null && apiToken.secret == null) {
                credsFromParameters = false;
                const conn = utils.GetConnection(apiToken.tenant);
                if (conn.key == null && conn.secret == null) {
                    console.log("API key and secret not specified as parameters and no saved values found!");
                    return;
                }
                apiToken.tenant = conn.tenant;
                apiToken.key = conn.key;
                apiToken.secret = conn.secret;
            }
            await run.TailLogs(apiToken, command.opts().sources, null);
        });

    logs
        .command("get")
        .helpOption("-l, --help", "Help")
        .addOption(common.dirOptionM)
        .description("Get ID Cloud logs for a give time period (max age 30 days)")
        .action(async (options, command) => {
            // console.log('list command called');
            const apiToken = {};
            apiToken.username = command.parent.opts().user;
            apiToken.password = command.parent.opts().password;
            apiToken.tenant = command.parent.opts().host;
            apiToken.deploymentType = command.parent.opts().type;
            apiToken.realm = command.parent.opts().realm;
            // console.log(apiToken);
            if (await GetTokens(apiToken)) {
                const configEntities = await run.GetAllConfigEntities(apiToken);
                if ("configurations" in configEntities) {
                    if (!fs.existsSync(command.opts().directory)) {
                        fs.mkdirSync(command.opts().directory);
                    }
                    configEntities.configurations.forEach(async x => {
                        // console.log(`- ${x._id}`);
                        const configEntity = await run.GetConfigEntity(apiToken, x._id);
                        fse.outputFile(`${command.opts().directory}/${x._id}.json`, JSON.stringify(configEntity, null, 2), function (err, data) {
                            if (err) {
                                return console.error(`ERROR - can't save config ${x._id} to file`, err);
                            }
                        });
                    })
                }
            }
        });

    logs.showHelpAfterError();
    return logs;
}
module.exports.Setup = Setup;