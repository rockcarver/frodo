import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function setup() {
  const program = new Command('command')
    .helpOption('-h, --help', 'Help')
    .description('Top-level command.')
    .executableDir(__dirname);

  program.command('sub', 'Sub-command.').showHelpAfterError();

  program.showHelpAfterError();
  return program;
}
