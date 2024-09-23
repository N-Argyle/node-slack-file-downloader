import path from 'path';
import glob from 'glob-promise';
import { argv } from './cli';
import { parseJsonFiles } from './parser';
import { downloadFiles } from './download';

async function main(): Promise<void> {
  const jsonFiles = await glob(path.join(argv.dir as string, '**', '*.json'), {
    ignore: [
      '**/node_modules/**',
      '**/package.json',
      '**/tsconfig.json',
      '**/*.schema.json'
    ]
  });
  console.log(`Found ${jsonFiles.length} JSON files.`);

  console.log('Parsing JSON files...');
  const downloadTasks = await parseJsonFiles(jsonFiles);
  console.log(`Found ${downloadTasks.length} files to download.`);

  console.log(`Starting downloads (max ${argv.concurrency} concurrent)...`);
  await downloadFiles(downloadTasks);

  console.log('\nAll files processed and downloaded successfully.');
}

main().catch(console.error);
