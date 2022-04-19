import chalk from 'chalk';
import storage from '../../storage/SessionStorage.js';

export function printMessage(message, type = "info") {
    if(storage.session.getItem('scriptFriendly')) {
        if(type == "data") {
            console.log(message);
        } else if(type == "info") {
            console.error(message);
        } else if(type == "warn") {
            console.error(chalk.cyan(message));
        } else if(type == "error") {
            console.error(chalk.redBright(message));
        } else {
            console.error(chalk.bgRedBright(message));
        }
    } else {
        if(type == "data" || type == "info" || type == "warn") {
            if(type == "warn") {
                console.log(chalk.cyan(message));
            } else {
                console.log(message);
            }            
        } else if(type == "error") {
            console.error(chalk.redBright(message));
        } else {
            console.error(chalk.bgRedBright(message));
        }
    }
}
