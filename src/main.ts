#!/usr/bin/env node
import path from 'path';
import glob from 'glob-promise';
import fs from 'fs';
import { argv } from './cli';
import { parseJsonFiles } from './parser';
import { downloadFiles } from './download';

async function main(): Promise<void> {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
  const version = packageJson.version;

  const jsonFiles = await glob(path.join(argv.dir as string, '**', '*.json'), {
    ignore: [
      '**/node_modules/**',
      '**/package.json',
      '**/tsconfig.json',
      '**/*.schema.json'
    ]
  });
  console.log(`\x1b[1mSlack File Downloader v${version}\x1b[0m`);

  console.log(`More info at \x1b[4mhttps://github.com/N-Argyle/node-slack-file-downloader\x1b[0m`);
  
  console.log(`Found ${jsonFiles.length} JSON files.`);

  console.log('Parsing JSON files...');
  const downloadTasks = await parseJsonFiles(jsonFiles);
  console.log(`Found ${downloadTasks.length} files to download.`);

  console.log(`Starting downloads (max ${argv.concurrency} concurrent)...`);
  await downloadFiles(downloadTasks);

  console.log('\nAll files processed and downloaded successfully.');
}

main().catch(console.error);
