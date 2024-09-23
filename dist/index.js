#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const glob_promise_1 = __importDefault(require("glob-promise"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const p_limit_1 = __importDefault(require("p-limit"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const helpers_1 = require("yargs/helpers");
const stream_1 = __importDefault(require("stream"));
const util_1 = require("util");
const pipeline = (0, util_1.promisify)(stream_1.default.pipeline);
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
async function downloadFile(url, outputPath) {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    await pipeline(response.body, fs_1.default.createWriteStream(outputPath));
}
async function downloadFiles(downloadTasks) {
    const limit = (0, p_limit_1.default)(argv.concurrency);
    const bar = new cli_progress_1.default.SingleBar({
        format: 'Progress |' + ansi_colors_1.default.cyan('{bar}') + '| {percentage}% || {value}/{total} Files || {file}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    let completedTasks = 0;
    bar.start(downloadTasks.length, 0, { file: 'Starting...' });
    const updateBar = (filename) => {
        completedTasks++;
        bar.update(completedTasks, { file: filename });
    };
    const downloadPromises = downloadTasks.map(task => limit(async () => {
        try {
            await downloadFile(task.url, task.outputPath);
            updateBar(path_1.default.basename(task.outputPath));
        }
        catch (error) {
            console.error(`Error downloading ${task.outputPath}: ${error.message}`);
            updateBar(`Error: ${path_1.default.basename(task.outputPath)}`);
        }
    }));
    await Promise.all(downloadPromises);
    bar.stop();
}
async function parseJsonFile(filePath) {
    const jsonContent = JSON.parse(await fs_2.promises.readFile(filePath, 'utf8'));
    if (!Array.isArray(jsonContent)) {
        console.log(`Skipping ${filePath}: Content is not an array`);
        return [];
    }
    const dirPath = path_1.default.dirname(filePath);
    return jsonContent.flatMap((message) => (message.files || [])
        .filter((file) => file.url_private_download)
        .map((file) => ({
        url: file.url_private_download,
        outputPath: path_1.default.join(dirPath, file.name)
    })));
}
async function parseJsonFiles(jsonFiles) {
    const allTasks = await Promise.all(jsonFiles.map(parseJsonFile));
    return allTasks.flat();
}
async function main() {
    const jsonFiles = await (0, glob_promise_1.default)(path_1.default.join(argv.dir, '**', '*.json'));
    console.log(`Found ${jsonFiles.length} JSON files.`);
    console.log('Parsing JSON files...');
    const downloadTasks = await parseJsonFiles(jsonFiles);
    console.log(`Found ${downloadTasks.length} files to download.`);
    console.log(`Starting downloads (max ${argv.concurrency} concurrent)...`);
    await downloadFiles(downloadTasks);
    console.log('\nAll files processed and downloaded successfully.');
}
main().catch(console.error);
