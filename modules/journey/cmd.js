import fs from 'fs';
import yesno from 'yesno';
import { Command, Option } from 'commander';
import * as common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import { listJourneys, getJourneyData, describeTree, importJourney, findOrphanedNodes, removeOrphanedNodes } from '../../api/TreeApi.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const journey = new Command("journey")
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOptionM)
        .addOption(common.userOption)
        .addOption(common.passwordOption)
        .addOption(common.realmOptionM)
        .addOption(common.deploymentOption)

    journey
        .command("list")
        .helpOption("-l, --help", "Help")
        .addOption(new Option("-a, --analyze", "Analyze journeys for custom nodes."))
        .description("List all the journeys/trees in a realm.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            console.log(`Listing journeys in realm ${storage.session.getRealm()}...`);
            if(await getTokens()) {
                var journeyList = await listJourneys(command.opts().analyze);
                journeyList.sort((a, b) => a.name.localeCompare(b.name));
                if (command.opts().analyze) {
                    journeyList.forEach((item, index) => {
                        console.log(`${item.name} ${item.custom?"(*)":""}`);
                    })
                    console.log("(*) Tree contains custom node(s).");
                }
                else {
                    journeyList.forEach((item, index) => {
                        console.log(`${item.name}`);
                    })
                }
            }
        });

    journey
        .command("describe")
        .helpOption("-l, --help", "Help")
        .addOption(common.treeOption)
        .addOption(common.fileOption)
        .addOption(common.versionOption)
        .description("If -h is supplied, describe the journey/tree indicated by -t, or \
all journeys/trees in the realm if no -t is supplied, otherwise \
describe the journey/tree export file indicated by -f.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            const treeDescription = [];
            if (typeof command.parent.opts().host == 'undefined' || typeof command.opts().file != 'undefined') {
                if (typeof command.opts().file == 'undefined') {
                    console.error("You either need -h or -f when using describe");
                    return;
                }
                console.log(`Describing local journey file ${command.opts().file}...`);
                try {
                    var data = fs.readFileSync(command.opts().file, 'utf8');
                    const journeyData = JSON.parse(data);
                    treeDescription.push(describeTree(journeyData));
                }
                catch (err) {
                    console.error(err);
                }
            } else {
                console.log(`Describing journey(s) in realm ${storage.session.getRealm()}...`);
                if(await getTokens()) {
                    if (typeof command.opts().tree == 'undefined') {
                        const journeyList = await listJourneys(false);
                        for (const item of journeyList) {
                            const journeyData = await getJourneyData(item.name);
                            treeDescription.push(describeTree(journeyData));
                        }
                    } else {
                        const journeyData = await getJourneyData(command.opts().tree);
                        treeDescription.push(describeTree(journeyData));
                    }
                }
            }
            for (const item of treeDescription) {
                console.log(`\nJourney: ${item.treeName}`);
                console.log("========");
                console.log("\nNodes:");
                for (const [name, count] of Object.entries(item.nodeTypes)) {
                    console.log(`- ${name}: ${count}`);
                }
                console.log("\nScripts:");
                for (const [name, desc] of Object.entries(item.scripts)) {
                    console.log(`- ${name}: ${desc}`);
                }
                console.log("\nEmail Templates:");
                for (const [id, displayName] of Object.entries(item.emailTemplates)) {
                    console.log(`- ${id}`);
                }
            }
        });

    journey
        .command("export")
        .helpOption("-l, --help", "Help")
        .addOption(new Option("-t, --tree <tree>", "Name of a journey/tree. If specified, -a and -A are ignored."))
        .addOption(new Option("-f, --file <file>", "Name of the file to write the exported journey(s) to. Ignored with -A."))
        .addOption(new Option("-a, --all", "Export all the journeys/trees in a realm. Ignored with -t."))
        .addOption(new Option("-A, --allSeparate", "Export all the journeys/trees in a realm as separate files <journey/tree name>.json. Ignored with -t or -a."))
        .description("Export journeys/trees.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            if(await getTokens()) {
                // export
                if (command.opts().tree) {
                    console.log('Exporting journey...');
                    let fileName = command.opts().tree+".json";
                    if (command.opts().file) {
                        fileName = command.opts().file;
                    }
                    const journeyData = await getJourneyData(command.opts().tree);
                    fs.writeFile(fileName, JSON.stringify(journeyData, null, 2), function (err, data) {
                        if (err) {
                            return console.error("ERROR - can't save journey to file");
                        }
                    });
                }
                // exportAll -a
                else if (command.opts().all) {
                    console.log('Exporting all journeys to a single file...');
                    let fileName = "allJourneys.json";
                    const journeysMap = {};
                    const topLevelMap = {};
                    const journeyList = await listJourneys(false);
                    for (const item of journeyList) {
                        journeysMap[item.name] = await getJourneyData(item.name);
                    }
                    topLevelMap.trees = journeysMap;    
                    if (command.opts().file) {
                        fileName = command.opts().file;
                    }
                    fs.writeFile(fileName, JSON.stringify(topLevelMap, null, 2), function (err, data) {
                        if (err) {
                            return console.error("ERROR - can't save journeys to file");
                        }
                    });
                }
                // exportAllSeparate -A
                else if (command.opts().allSeparate) {
                    console.log('Exporting all journeys to separate files...');
                    const journeyList = await listJourneys(false);
                    for (const item of journeyList) {
                        const journeyData = await getJourneyData(item.name);
                        let fileName = `./${item.name}.json`;
                        fs.writeFile(fileName, JSON.stringify(journeyData, null, 2), function (err, data) {
                            if (err) {
                                return console.error(`ERROR - can't save journey ${item.name} to file`);
                            }
                        });
                    }
                }
                // unrecognized combination of options or no options
                else {
                    console.log('Unrecognized combination of options or no options...');
                    command.help();
                }
            }
        });

    journey
        .command("import")
        .helpOption("-l, --help", "Help")
        .addOption(common.treeOptionM)
        .addOption(common.fileOptionM)
        .addOption(common.noReUUIDOption)
        .description("Import journey/tree.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            console.log("Importing journey/tree...");
            if(await getTokens()) {
                fs.readFile(command.opts().file, 'utf8', function (err, data) {
                    if (err) throw err;
                    const journeyData = JSON.parse(data);
                    importJourney(command.opts().tree, journeyData, command.opts().noReUUIDOption, true).then(result=>{
                        if(!result == null)
                            console.log("Import done.");
                    });
                });
            }
        });

    journey
        .command("importAll")
        .helpOption("-l, --help", "Help")
        .addOption(common.fileOptionM)
        .addOption(common.noReUUIDOption)
        .description("Import all the trees in a realm.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            console.log("Importing journey/tree...");
            if(await getTokens()) {
                fs.readFile(command.opts().file, 'utf8', function (err, data) {
                    if (err) throw err;
                    const journeyData = JSON.parse(data);
                    ImportAllJourneys(journeyData, command.opts().noReUUIDOption, false).then(result=>{
                        if(!result == null)
                            console.log("Import all done.");
                    });
                });
            }
        });

    journey
        .command("prune")
        .helpOption("-l, --help", "Help")
        .description("Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.")
        .action(async (options, command) => {
            storage.session.setUsername(command.parent.opts().user);
            storage.session.setPassword(command.parent.opts().password);
            storage.session.setTenant(command.parent.opts().host);
            storage.session.setDeploymentType(command.parent.opts().type);
            storage.session.setRealm(command.parent.opts().realm);
            console.log("Pruning orphaned configuration artifacts...");
            if(await getTokens()) {
                const allNodes = [];
                const orphanedNodes = [];
                console.log("Analyzing authentication nodes configuration artifacts...");
                await findOrphanedNodes(allNodes, orphanedNodes);
                console.log(`Total nodes:       ${allNodes.length}`);
                console.log(`Orphaned nodes:    ${orphanedNodes.length}`);
                // console.log(orphanedNodes);
                const ok = await yesno({
                    question: "Do you want to prune (permanently delete) all the orphaned node instances?(y|n):"
                });
                if(ok) {
                    process.stdout.write("Pruning.");
                    removeOrphanedNodes(allNodes, orphanedNodes);
                }
                process.stdout.write("done");
                console.log("");
            }
        });
    journey.showHelpAfterError();
    return journey;
}
