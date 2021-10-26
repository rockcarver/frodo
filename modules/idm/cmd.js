const replaceall = require("replaceall");
const fs = require("fs");
const fse = require("fs-extra");
const propertiesReader = require('properties-reader');
const {
    Command
} = require("commander");

const common = require("../cmd_common.js");

const {
    GetTokens
} = require("../../auth.js")

const run = require("./run.js");

function Setup() {
    const idm = new Command("idm"); 
    idm
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOption.makeOptionMandatory())
        .addOption(common.userOption)
        .addOption(common.passwordOption)
        .addOption(common.deploymentOption)
        .description("IDM related operations")

    idm
        .command("list")
        .helpOption("-l, --help", "Help")
        .description("List all IDM configuration objects")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            // console.log(frToken);
            await GetTokens(frToken);
            const configEntities = await run.GetAllConfigEntities(frToken);
            if("configurations" in configEntities) {
                configEntities.configurations.forEach(x => {
                    console.log(`- ${x._id}`);
                })
            }
        });

    idm
        .command("export")
        .helpOption("-l, --help", "Help")
        .addOption(common.nameOption.makeOptionMandatory())
        .addOption(common.fileOption)
        // .addOption(common.fileOption.makeOptionMandatory())
        .description("Export an IDM configuration object from a deployment")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            // console.log(command.opts());
            await GetTokens(frToken);
            const configEntity = await run.GetConfigEntity(frToken, command.opts().name);
            if (command.opts().file) {
                fs.writeFile(command.opts().file, JSON.stringify(configEntity, null, 2), function (err, data) {
                    if (err) {
                        return console.error(`ERROR - can't save ${command.opts().name} export to file`);
                    }
                });
            } else {
                console.log(JSON.stringify(configEntity, null, 2));
            }
        });

    idm
        .command("exportAllRaw")
        .helpOption("-l, --help", "Help")
        .addOption(common.dirOption.makeOptionMandatory())
        .description("Export all IDM configuration objects from a deployment into separate JSON files in a directory specified by <directory>")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            // console.log(frToken);
            await GetTokens(frToken);
            const configEntities = await run.GetAllConfigEntities(frToken);
            if("configurations" in configEntities) {
                if (!fs.existsSync(command.opts().directory)){
                    fs.mkdirSync(command.opts().directory);
                }
                configEntities.configurations.forEach(async x => {
                    // console.log(`- ${x._id}`);
                    const configEntity = await run.GetConfigEntity(frToken, x._id);
                    fse.outputFile(`${command.opts().directory}/${x._id}.json`, JSON.stringify(configEntity, null, 2), function (err, data) { 
                        if (err) {
                            return console.error(`ERROR - can't save config ${x._id} to file`, err);
                        }
                    });
                })
            }
        });

    idm
        .command("exportAll")
        .helpOption("-l, --help", "Help")
        .addOption(common.dirOption.makeOptionMandatory())
        .addOption(common.entitiesFileOption.makeOptionMandatory())
        .addOption(common.envFileOption.makeOptionMandatory())
        .description("Export all IDM configuration objects from a deployment")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            // console.log(frToken);
            await GetTokens(frToken);
            let entriesToExport = [];
            const envFileData = {};
            // read list of entities to export
            fs.readFile(command.opts().entitiesFile, 'utf8', async function (err, data) {
                if (err) throw err;
                const entriesData = JSON.parse(data);
                entriesToExport = entriesData.idm;
                // console.log(`entriesToExport ${entriesToExport}`);

                // read list of configs to parameterize for environment specific values
                var envParams = propertiesReader(command.opts().envFile);
                
                const configEntities = await run.GetAllConfigEntities(frToken);
                if("configurations" in configEntities) {
                    // create export directory if not exist
                    if (!fs.existsSync(command.opts().directory)){
                        fs.mkdirSync(command.opts().directory);
                    }        
                    configEntities.configurations.forEach(async x => {
                        // console(x)
                        if(entriesToExport.includes(x._id)) {
                            // if entity is in the list of entities to export
                            const configEntity = await run.GetConfigEntity(frToken, x._id);
                            let configEntityString = JSON.stringify(configEntity, null, 2);
                            envParams.each((key, value) => {
                                configEntityString = replaceall(value, "${"+key+"}", configEntityString);
                            });
                            fs.writeFile(`${command.opts().directory}/${x._id}.json`, configEntityString, function (err, data) {
                                if (err) {
                                    return console.error(`ERROR - can't save config ${x._id} to file`);
                                }
                            });
                        }
                    });
                }
            });
        });

    idm
        .command("import")
        .helpOption("-l, --help", "Help")
        .description("Import an IDM configuration object into a deployment")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            // console.log(frToken);
            await GetTokens(frToken);
            // const journeyList = await ListJourneys(frToken);
            // console.log(`List of journeys in realm ${frToken.realm}`);
            // journeyList.forEach((item, index) => {
            //     console.log(`- ${item.name} ${item.custom?"*":""}`);
            // })
            // console.log("(*) Tree contains custom node(s).");
        });

    idm
        .command("importAll")
        .helpOption("-l, --help", "Help")
        .description("Import all IDM configuration objects into a deployment")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            // console.log(frToken);
            await GetTokens(frToken);
            // const journeyList = await ListJourneys(frToken);
            // console.log(`List of journeys in realm ${frToken.realm}`);
            // journeyList.forEach((item, index) => {
            //     console.log(`- ${item.name} ${item.custom?"*":""}`);
            // })
            // console.log("(*) Tree contains custom node(s).");
        });

    return idm;
}
module.exports.Setup = Setup;
