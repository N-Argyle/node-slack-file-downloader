import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

export const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: 'Directory to scan for JSON files',
    default: process.cwd()
  })
  .option('concurrency', {
    alias: 'c',
    type: 'number',
    description: 'Number of concurrent downloads',
    default: 3
  })
  .help()
  .argv;