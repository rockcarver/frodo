import chalk from 'chalk';
import storage from '../../storage/SessionStorage.js';

function log(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.log(message);
  }
}

function info(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(message);
  }
}

function warn(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(chalk.cyan(message));
  }
}

function error(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(chalk.redBright(message));
  }
}

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
// eslint-disable-next-line import/prefer-default-export
export function printMessage(message, type = 'info', newline = true) {
  if (storage.session.getItem('scriptFriendly')) {
    switch (type) {
      case 'data':
        if (newline) {
          log(message);
        } else {
          process.stdout.write(message);
        }
        break;
      case 'info':
        if (newline) {
          info(message);
        } else {
          process.stderr.write(message);
        }
        break;
      case 'warn':
        if (newline) {
          warn(message);
        } else {
          process.stderr.write(chalk.cyan(message));
        }
        break;
      case 'error':
        if (newline) {
          error(message);
        } else {
          process.stderr.write(chalk.redBright(message));
        }
        break;
      default:
        if (newline) {
          error(message);
        } else {
          process.stderr.write(chalk.bgRedBright(message));
        }
    }
  } else {
    switch (type) {
      case 'warn':
        if (newline) {
          log(message);
        } else {
          process.stdout.write(chalk.cyan(message));
        }
        break;
      case 'data':
      case 'info':
        if (newline) {
          console.log(message);
        } else {
          process.stdout.write(message);
        }
        break;
      case 'error':
        if (newline) {
          error(message);
        } else {
          process.stderr.write(chalk.redBright(message));
        }
        break;
      default:
        if (newline) {
          error(message);
        } else {
          process.stderr.write(chalk.bgRedBright(message));
        }
    }
  }
}
