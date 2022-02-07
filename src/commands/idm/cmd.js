import replaceall from 'replaceall';
import fs from 'fs';
import fse from 'fs-extra';
import propertiesReader from 'properties-reader';
import { Command } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { getAllConfigEntities, getConfigEntity, getCount } from '../../api/IdmConfigApi.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const idm = new Command("idm"); 
    idm
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOptionM)
        .addOption(common.userOption)
        .addOption(common.passwordOption)
        .addOption(common.deploymentOption)
        .description("Manage IDM configuration.")

    idm
        .command("list")
        .helpOption("-l, --help", "Help")
        .description("List all IDM configuration objects.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log("Listing all IDM configuration objects...");
            if(await getTokens()) {
                const configEntities = await getAllConfigEntities();
                if("configurations" in configEntities) {
                    configEntities.configurations.forEach(x => {
                        console.log(`- ${x._id}`);
                    })
                }
            }
        });

    idm
        .command("export")
        .helpOption("-l, --help", "Help")
        .addOption(common.nameOptionM)
        .addOption(common.fileOption)
        // .addOption(common.fileOption.makeOptionMandatory())
        .description("Export an IDM configuration object.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log("Exporting an IDM configuration object...");
            if(await getTokens()) {
                const configEntity = await getConfigEntity(command.opts().name);
                if (command.opts().file) {
                    fs.writeFile(command.opts().file, JSON.stringify(configEntity, null, 2), function (err, data) {
                        if (err) {
                            return console.error(`ERROR - can't save ${command.opts().name} export to file`);
                        }
                    });
                } else {
                    console.log(JSON.stringify(configEntity, null, 2));
                }
            }
        });

    idm
        .command("exportAllRaw")
        .helpOption("-l, --help", "Help")
        .addOption(common.dirOptionM)
        .description("Export all IDM configuration objects into separate JSON files in a directory specified by <directory>")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log(`Exporting all IDM configuration objects into separate JSON files in ${command.opts().directory}...`);
            if(await getTokens()) {
                const configEntities = await getAllConfigEntities();
                if("configurations" in configEntities) {
                    if (!fs.existsSync(command.opts().directory)){
                        fs.mkdirSync(command.opts().directory);
                    }
                    configEntities.configurations.forEach(async x => {
                        // console.log(`- ${x._id}`);
                        const configEntity = await getConfigEntity(x._id);
                        fse.outputFile(`${command.opts().directory}/${x._id}.json`, JSON.stringify(configEntity, null, 2), function (err, data) { 
                            if (err) {
                                return console.error(`ERROR - can't save config ${x._id} to file`, err);
                            }
                        });
                    })
                }
            }
        });

    idm
        .command("exportAll")
        .helpOption("-l, --help", "Help")
        .addOption(common.dirOptionM)
        .addOption(common.entitiesFileOptionM)
        .addOption(common.envFileOptionM)
        .description("Export all IDM configuration objects.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log("Exporting all IDM configuration objects...");
            if(await getTokens()) {
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
                    
                    const configEntities = await getAllConfigEntities();
                    if("configurations" in configEntities) {
                        // create export directory if not exist
                        if (!fs.existsSync(command.opts().directory)){
                            fs.mkdirSync(command.opts().directory);
                        }        
                        configEntities.configurations.forEach(async x => {
                            // console(x)
                            if(entriesToExport.includes(x._id)) {
                                // if entity is in the list of entities to export
                                const configEntity = await getConfigEntity(x._id);
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
            }
        });

    idm
        .command("import")
        .helpOption("-l, --help", "Help")
        .description("Import an IDM configuration object.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log("Importing an IDM configuration object...");
            if(await getTokens()) {
                // implement
            }
        });

    idm
        .command("importAll")
        .helpOption("-l, --help", "Help")
        .description("Import all IDM configuration objects.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log("Importing all IDM configuration objects...");
            if(await getTokens()) {
                // implement
            }
        });

    idm
        .command("count")
        .helpOption("-l, --help", "Help")
        .addOption(common.managedNameOptionM)
        .description("Count number of managed objects of a given type.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            console.log(`Counting managed ${command.opts().name} objects...`);
            if(await getTokens()) {
                console.log(`Total count of [${command.opts().name}] objects : ${await getCount(command.opts().name)}`);
            }
        });

    idm.showHelpAfterError();
    return idm;
}
