fs = require("fs")
const {
    Command
} = require("commander");

const common = require("../cmd_common.js");

const {
    GetTokens
} = require("../../auth.js")

function Setup() {
    const info = new Command("info"); 
    info
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOption.makeOptionMandatory())
        .addOption(common.userOption.makeOptionMandatory())
        .addOption(common.passwordOption.makeOptionMandatory())
        .addOption(common.deploymentOption)
        .description("Login, print versions and tokens, then exit")
        .action(async (options, command) => {
            // console.log(command.opts());
            let frToken = {};
            frToken.username = command.opts().user;
            frToken.password = command.opts().password;
            frToken.tenant = command.opts().host;
            frToken.deploymentType = command.opts().type;
            // console.log(frToken);
            await GetTokens(frToken);
            console.log("Cookie name: " + frToken.cookieName);
            console.log("Session token: " + frToken.cookieValue);
            if (frToken.bearerToken) {
                console.log("Bearer token: " + frToken.bearerToken);
            }
        });
    return info;
}
module.exports.Setup = Setup;
