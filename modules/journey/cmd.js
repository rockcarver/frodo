fs = require("fs")
const yesno = require('yesno');
const {
    Command
} = require("commander");

const common = require("../cmd_common.js");
const {
    GetTokens
} = require("../../auth.js")

const {
    ListJourneys,
    GetJourneyData,
    DescribeTree,
    ImportJourney,
    FindOrphanedNodes,
    RemoveOrphanedNodes
} = require("./run.js");

function Setup() {
    const journey = new Command("journey")
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOption.makeOptionMandatory())
        .addOption(common.userOption.makeOptionMandatory())
        .addOption(common.passwordOption.makeOptionMandatory())
        .addOption(common.realmOption.makeOptionMandatory())
        .addOption(common.deploymentOption)

    journey
        .command("list")
        .helpOption("-l, --help", "Help")
        .description("List all the trees in a realm.")
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
            const journeyList = await ListJourneys(frToken);
            console.log(`List of journeys in realm ${frToken.realm}`);
            journeyList.forEach((item, index) => {
                console.log(`- ${item.name} ${item.custom?"*":""}`);
            })
            console.log("(*) Tree contains custom node(s).");
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
            console.log('describe command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            const treeDescription = [];
            if (typeof command.opts().host == 'undefined') {
                if (typeof command.opts().file == 'undefined') {
                    console.error("You either need -h or -f when using describe");
                    return;
                }
                fs.readFile(command.opts().file, 'utf8', function (err, data) {
                    if (err) throw err;
                    const journeyData = JSON.parse(data);
                    treeDescription.push(DescribeTree(journeyData));
                });
            } else {
                await GetTokens(frToken);
                if (typeof command.opts().tree == 'undefined') {
                    const journeyList = await ListJourneys(frToken);
                    for (const item of journeyList) {
                        const journeyData = await GetJourneyData(frToken, item.name);
                        treeDescription.push(DescribeTree(journeyData));
                    }
                } else {
                    const journeyData = await GetJourneyData(frToken, command.opts().tree);
                    treeDescription.push(DescribeTree(journeyData));
                }
            }
            for (const item of treeDescription) {
                console.log("\n==========");
                console.log(`Tree name: ${item.treeName}`);
                console.log("Nodes:");
                for (const [name, count] of Object.entries(item.nodeTypes)) {
                    console.log(`\t- ${name}: ${count}`);
                }
                console.log("Scripts (Name: Description):");
                for (const [name, desc] of Object.entries(item.scripts)) {
                    console.log(`\t- ${name}: ${desc}`);
                }
                console.log("==========");
            }
        });

    journey
        .command("export")
        .helpOption("-l, --help", "Help")
        .addOption(common.treeOption.makeOptionMandatory())
        .addOption(common.fileOption)
        .description("Export an authentication journey/tree.")
        .action(async (options, command) => {
            console.log('export command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            const journeyData = await GetJourneyData(frToken, command.opts().tree);
            if (command.opts().file) {
                fs.writeFile(command.opts().file, JSON.stringify(journeyData, null, 2), function (err, data) {
                    if (err) {
                        return console.error("ERROR - can't save journey to file");
                    }
                });
            } else {
                console.log(JSON.stringify(journeyData, null, 2));
            }
        });

    journey
        .command("exportAll")
        .helpOption("-l, --help", "Help")
        .description("Export all the journeys/trees in a realm.")
        .action(async (options, command) => {
            console.log('exportAll command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            const journeysMap = {};
            const topLevelMap = {};
            const journeyList = await ListJourneys(frToken);
            for (const item of journeyList) {
                journeysMap[item.name] = await GetJourneyData(frToken, item.name);
            }
            topLevelMap.trees = journeysMap;
            console.log(JSON.stringify(topLevelMap, null, 2));
        });

    journey
        .command("exportAllSeparate")
        .helpOption("-l, --help", "Help")
        .addOption(common.treeOption.makeOptionMandatory())
        .description("Export all the journeys/trees in a realm as separate files of the \
format <journey/tree name>.json.")
        .action(async (options, command) => {
            console.log('exportAllSeparate command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            const journeyList = await ListJourneys(frToken);
            for (const item of journeyList) {
                const journeyData = await GetJourneyData(frToken, item.name);
                fs.writeFile(`./${item}.json`, JSON.stringify(journeyData, null, 2), function (err, data) {
                    if (err) {
                        return console.error(`ERROR - can't save journey ${item} to file`);
                    }
                });
            }
            topLevelMap.trees = journeysMap;
            console.log(JSON.stringify(topLevelMap, null, 2));
        });

    journey
        .command("import")
        .helpOption("-l, --help", "Help")
        .addOption(common.treeOption.makeOptionMandatory())
        .addOption(common.fileOption.makeOptionMandatory())
        .addOption(common.noReUUIDOption)
        .description("Import an authentication tree")
        .action(async (options, command) => {
            console.log('import command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            fs.readFile(command.opts().file, 'utf8', function (err, data) {
                if (err) throw err;
                const journeyData = JSON.parse(data);
                ImportJourney(frToken, command.opts().tree, journeyData, command.opts().noReUUIDOption, true).then(result=>{
                    if(!result == null)
                        console.log("Import done.");
                });
            });
        });

    journey
        .command("importAll")
        .helpOption("-l, --help", "Help")
        .addOption(common.fileOption.makeOptionMandatory())
        .addOption(common.noReUUIDOption)
        .description("Import all the trees in a realm.")
        .action(async (options, command) => {
            console.log('import all command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            fs.readFile(command.opts().file, 'utf8', function (err, data) {
                if (err) throw err;
                const journeyData = JSON.parse(data);
                ImportAllJourneys(frToken, journeyData, command.opts().noReUUIDOption, false).then(result=>{
                    if(!result == null)
                        console.log("Import all done.");
                });
            });
        });

    journey
        .command("prune")
        .helpOption("-l, --help", "Help")
        .description("Prune orphaned configuration artifacts left behind after deleting authentication trees. You will be prompted before any destructive operations are performed.")
        .action(async (options, command) => {
            console.log('prune command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            await GetTokens(frToken);
            const allNodes = [];
            const orphanedNodes = [];
            console.log("Analyzing authentication nodes configuration artifacts...");
            await FindOrphanedNodes(frToken, allNodes, orphanedNodes);
            console.log(`Total nodes:       ${allNodes.length}`);
            console.log(`Orphaned nodes:    ${orphanedNodes.length}`);
            // console.log(orphanedNodes);
            const ok = await yesno({
                question: "Do you want to prune (permanently delete) all the orphaned node instances?(y|n):"
            });
            if(ok) {
                process.stdout.write("Pruning.");
                // RemoveOrphanedNodes(frToken, allNodes, orphanedNodes);
            }
            process.stdout.write("done");
            console.log("");
        });

    return journey;
}
module.exports.Setup = Setup;
