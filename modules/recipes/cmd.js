const fs = require("fs");
const {
    Command
} = require("commander");

const common = require("../cmd_common.js");

const {
    GetTokens
} = require("../../auth.js")

// const run = require("./run.js");

function Setup() {
    const recipes = [];
    for (const f of fs.readdirSync("./modules/recipes", {withFileTypes: true})) {
        if (f.isDirectory()) {
            recipes.push(f.name);
        }
    }
    const recipe = new Command("recipe"); 
    recipe
        // ************************************
        // TODO: custom help - list all recipes
        // ************************************
        .helpOption("-l, --help", "Help")
        .addHelpText('after', `

available recipes:
${recipes}`)
        .addOption(common.hostOption.makeOptionMandatory())
        .addOption(common.userOption)
        .addOption(common.passwordOption)
        .addOption(common.realmOption.makeOptionMandatory())
        .addOption(common.deploymentOption)
        .description("Create prepared configuration to achieve a specific use case")

    recipe
        .command("cook")
        .helpOption("-l, --help", "Help")
        .addOption(common.nameOption.makeOptionMandatory())
        .description("Run a specific recipe")
        .action(async (options, command) => {
            // console.log('list command called');
            const frToken = {};
            frToken.username = command.parent.opts().user;
            frToken.password = command.parent.opts().password;
            frToken.tenant = command.parent.opts().host;
            frToken.deploymentType = command.parent.opts().type;
            frToken.realm = command.parent.opts().realm;
            // console.log(command.opts());
            await GetTokens(frToken);
            let r = require(`./${command.opts().name}/run.js`);
            r.Cook(frToken, command.opts().name);
        });
    return recipe;
}
module.exports.Setup = Setup;
