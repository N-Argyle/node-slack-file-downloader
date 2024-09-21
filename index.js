#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const fetch = require('node-fetch');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: 'Directory to scan for JSON files',
    default: process.cwd()
  })
  .help()
  .argv;

async function downloadFile(url, outputPath) {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function processJsonFile(filePath) {
  const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const dirPath = path.dirname(filePath);

  if (!Array.isArray(jsonContent)) {
    console.log(`Skipping ${filePath}: Content is not an array`);
    return;
  }

  for (const message of jsonContent) {
    if (message.files && Array.isArray(message.files)) {
      for (const file of message.files) {
        if (file.url_private_download) {
          const outputPath = path.join(dirPath, file.name);
          console.log(`Downloading ${file.name} to ${outputPath}`);
          await downloadFile(file.url_private_download, outputPath);
        }
      }
    }
  }
}

async function main() {
  const jsonFiles = glob.sync(path.join(argv.dir, '**', '*.json'));
  
  for (const filePath of jsonFiles) {
    console.log(`Processing ${filePath}`);
    await processJsonFile(filePath);
  }
  
  console.log('All files processed successfully.');
}

main().catch(console.error);
