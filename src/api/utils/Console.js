import chalk from 'chalk';
import storage from '../../storage/SessionStorage.js';

/**
 * Prints a string message to console
 *
 * @param {string} message The string message to print
 * @param {string} [type=info] "info", "warn", "error" or "data". By default, "warn" and "error" will be
 * written to stderr. If scriptFriendly mode is enabled only type="data" is written to stdout (rest go
 * to stderr)
 * @param {boolean} [newline=true] Whether to add a new at the end of message
 * 
 */
export function printMessage(message, type = "info", newline = true) {
    if(storage.session.getItem('scriptFriendly')) {
        if(type == "data") {
            newline?console.log(message):process.stdout.write(message);
        } else if(type == "info") {
            newline?console.error(message):process.stderr.write(message)
        } else if(type == "warn") {
            newline?console.error(chalk.cyan(message)):process.stderr.write(chalk.cyan(message));
        } else if(type == "error") {
            newline?console.error(chalk.redBright(message)):process.stderr.write(chalk.redBright(message));
        } else {
            newline?console.error(chalk.bgRedBright(message)):process.stderr.write(chalk.bgRedBright(message));
        }
    } else {
        if(type == "data" || type == "info" || type == "warn") {
            if(type == "warn") {
                newline?console.log(chalk.cyan(message)):process.stdout.write(chalk.cyan(message));
            } else {
                newline?console.log(message):process.stdout.write(message);
            }            
        } else if(type == "error") {
            newline?console.error(chalk.redBright(message)):process.stderr.write(chalk.redBright(message));
        } else {
            newline?console.error(chalk.bgRedBright(message)):process.stderr.write(chalk.bgRedBright(message));
        }
    }
}
