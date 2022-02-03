import { Command } from 'commander';
import common from '../cmd_common.js';
import { getTokens } from '../../api/AuthApi.js';
import storage from '../../storage/SessionStorage.js';

export function setup() {
    const info = new Command("info"); 
    info
        .helpOption("-l, --help", "Help")
        .addOption(common.hostOption.makeOptionMandatory())
        .addOption(common.userOption)
        .addOption(common.passwordOption)
        .addOption(common.deploymentOption)
        .description("Login, print versions and tokens, then exit")
        .action(async (options, command) => {
            storage.session.setUsername(command.opts().user);
            storage.session.setPassword(command.opts().password);
            storage.session.setTenant(command.opts().host);
            storage.session.setDeploymentType(command.opts().type);
            console.log("Printing versions and tokens...");
            if(await getTokens()) {
                console.log("Cookie name: " + storage.session.getCookieName());
                console.log("Session token: " + storage.session.getCookieValue());
                if (storage.session.getBearerToken()) {
                    console.log("Bearer token: " + storage.session.getBearerToken());
                }    
            }
        });
    info.showHelpAfterError();
    return info;
}
