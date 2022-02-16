import fs from 'fs';
import yesno from 'yesno';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { listEmailTemplates, getEmailTemplate, putEmailTemplate } from '../../api/EmailTemplateApi.js';
import { saveToFile, validateImport } from '../../api/utils/ExportImportUtils.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const emailTemplate = new Command("email_templates")
        .helpOption("-h, --help", "Help")
        .description("Manage email templates.");

    emailTemplate
        .command("list")
        .addArgument(common.hostArgumentM)
        .addArgument(common.userArgument)
        .addArgument(common.passwordArgument)
        .helpOption("-h, --help", "Help")
        .addOption(common.deploymentOption)
        .description("List all the email templates in the system.")
        .action(async (host, user, password, options, command) => {
            storage.session.setTenant(host);
            storage.session.setUsername(user);
            storage.session.setPassword(password);
            storage.session.setDeploymentType(options.type);
            if(await getTokens()) {
                console.log(`Listing email templates ...`);
                var templateList = await listEmailTemplates();
                // console.log(templateList);
                templateList.sort((a, b) => a._id.localeCompare(b._id));
                templateList.forEach((item, index) => {
                    console.log(`- ${item._id.replaceAll("emailTemplate/", "")}`);
                })
            }
        });

    emailTemplate
        .command("export")
        .addArgument(common.hostArgumentM)
        .addArgument(common.userArgument)
        .addArgument(common.passwordArgument)
        .helpOption("-h, --help", "Help")
        .addOption(common.deploymentOption)
        .addOption(new Option("-t, --template <template>", "Name of email template. If specified, -a and -A are ignored."))
        .addOption(new Option("-f, --file <file>", "Name of the file to write the exported email template(s) to. Ignored with -A."))
        .addOption(new Option("-a, --all", "Export all the email templates in the system. Ignored with -t."))
        .addOption(new Option("-A, --allSeparate", "Export all the email templates as separate files <template>.json. Ignored with -s or -a."))
        .description("Export email templates.")
        .action(async (host, user, password, options, command) => {
            storage.session.setTenant(host);
            storage.session.setUsername(user);
            storage.session.setPassword(password);
            storage.session.setDeploymentType(options.type);
            let templateData = null;
            if(await getTokens()) {
                // export
                if (command.opts().template) {
                    console.log('Exporting template...');
                    let fileName = command.opts().template+".json";
                    if (command.opts().file) {
                        fileName = command.opts().file;
                    }
                    templateData = await getEmailTemplate(command.opts().template);
                    // console.log(templateData);
                    saveToFile("emailTemplate", [templateData], "_id", fileName);
                }
                // exportAll -a
                else if (command.opts().all) {
                    console.log('Exporting all email templates to a single file...');
                    let fileName = "allEmailTemplates.json";
                    const templateList = await listEmailTemplates();
                    let allTemplatesData = [];
                    for (const item of templateList) {
                        templateData = await getEmailTemplate(`${item._id.replaceAll("emailTemplate/", "")}`);
                        allTemplatesData.push(item);
                    }
                    if (command.opts().file) {
                        fileName = command.opts().file;
                    }
                    saveToFile("emailTemplate", allTemplatesData, "_id", fileName);
                }
                // exportAllSeparate -A
                else if (command.opts().allSeparate) {
                    console.log('Exporting all email templates to separate files...');
                    const templateList = await listEmailTemplates();
                    for (const item of templateList) {
                        templateData = await getEmailTemplate(`${item._id.replaceAll("emailTemplate/", "")}`);
                        let fileName = `./${item._id.replaceAll("emailTemplate/", "")}.json`;
                        saveToFile("emailTemplate", [templateData], "_id", fileName);
                    }
                }
                // unrecognized combination of options or no options
                else {
                    console.log('Unrecognized combination of options or no options...');
                    command.help();
                }
            }
        });

    emailTemplate
        .command("import")
        .addArgument(common.hostArgumentM)
        .addArgument(common.userArgument)
        .addArgument(common.passwordArgument)
        .helpOption("-h, --help", "Help")
        .addOption(common.deploymentOption)
        .addOption(common.fileOptionM)
        .description("Import email template.")
        .action(async (host, user, password, options, command) => {
            storage.session.setTenant(host);
            storage.session.setUsername(user);
            storage.session.setPassword(password);
            storage.session.setDeploymentType(options.type);
            if(await getTokens()) {
                console.log(`Importing email templates(s) ...`);
                fs.readFile(command.opts().file, 'utf8', function (err, data) {
                    if (err) throw err;
                    const templateData = JSON.parse(data);
                    if(validateImport(templateData.meta)) {
                        for(let id in templateData.emailTemplate) {
                            console.log(id);
                            // console.log(templateData.script[id]);
                            putEmailTemplate(id.replaceAll("emailTemplate/", ""), id, templateData.emailTemplate[id]).then(result=>{
                                if(!result == null)
                                    console.log(`Imported ${id}`);
                            });
                        }
                    } else {
                        console.error("Import validation failed...");
                    }
                });
            }
        });

    emailTemplate.showHelpAfterError();
    return emailTemplate;
}
