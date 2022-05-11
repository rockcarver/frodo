/* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
import chalk from 'chalk';
import { SingleBar, Presets } from 'cli-progress';
import { createSpinner } from 'nanospinner';
import storage from '../../storage/SessionStorage.js';

function data(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.log(message);
  }
}

function text(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(message);
  }
}

function info(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(chalk.blueBright(message));
  }
}

function warn(message) {
  switch (typeof message) {
    case 'object':
      console.dir(message);
      break;
    default:
      console.error(chalk.yellow(message));
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
 * @param {string} [type=text] "text", "info", "warn", "error" or "data". All but
 * type="data" will be written to stderr.
 * @param {boolean} [newline=true] Whether to add a new at the end of message
 *
 */
// eslint-disable-next-line import/prefer-default-export
export function printMessage(message, type = 'text', newline = true) {
  //   if (storage.session.getItem('scriptFriendly')) {
  switch (type) {
    case 'data':
      if (newline) {
        data(message);
      } else {
        process.stdout.write(message);
      }
      break;
    case 'text':
      if (newline) {
        text(message);
      } else {
        process.stderr.write(message);
      }
      break;
    case 'info':
      if (newline) {
        info(message);
      } else {
        process.stderr.write(chalk.blueBright(message));
      }
      break;
    case 'warn':
      if (newline) {
        warn(message);
      } else {
        process.stderr.write(chalk.yellow(message));
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

/**
 * Creates a progress bar on stderr
 *
 * Example:
 * [========================================] 100% | 49/49 | Analyzing journey - transactional_auth
 *
 * @param {int} total The total number of entries to track progress for
 * @param {string} [data] The string message to show at the end ("Analyzing journey - transactional_auth"
 * in the example). default is empty string.
 *
 */
export function createProgressBar(
  total,
  // eslint-disable-next-line no-shadow
  data = null,
  options = {
    format: '[{bar}] {percentage}% | {value}/{total} | {data}',
  }
) {
  let opt = options;
  if (data == null) {
    opt = {
      format: '[{bar}] {percentage}% | {value}/{total}',
    };
  }
  let pBar = storage.session.getItem('progressBar');
  if (!pBar) pBar = new SingleBar(opt, Presets.legacy); // create only when needed
  pBar.start(total, 0, {
    data,
  });
  storage.session.setItem('progressBar', pBar);
}

/**
 * Updates the progress bar by 1
 *
 * @param {string} data The string message to show at the end ("Analyzing journey - transactional_auth"
 * in the example)
 *
 */
// eslint-disable-next-line no-shadow
export function updateProgressBar(data = null) {
  const pBar = storage.session.getItem('progressBar');
  if (data)
    pBar.increment({
      data,
    });
  else pBar.increment();
}

/**
 * Stop and hide the progress bar
 */
export function stopProgressBar() {
  const pBar = storage.session.getItem('progressBar');
  pBar.stop();
}

export function showSpinner(message) {
  const spinner = createSpinner(message).start();
  storage.session.setItem('Spinner', spinner);
}

export function stopSpinner() {
  const spinner = storage.session.getItem('Spinner');
  if (spinner) spinner.success();
}

export function spinSpinner() {
  const spinner = storage.session.getItem('Spinner');
  if (spinner) spinner.spin();
}
