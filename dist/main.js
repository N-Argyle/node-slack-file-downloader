#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const glob_promise_1 = __importDefault(require("glob-promise"));
const cli_1 = require("./cli");
const parser_1 = require("./parser");
const download_1 = require("./download");
async function main() {
    const jsonFiles = await (0, glob_promise_1.default)(path_1.default.join(cli_1.argv.dir, '**', '*.json'), {
        ignore: [
            '**/node_modules/**',
            '**/package.json',
            '**/tsconfig.json',
            '**/*.schema.json'
        ]
    });
    console.log(`Found ${jsonFiles.length} JSON files.`);
    console.log('Parsing JSON files...');
    const downloadTasks = await (0, parser_1.parseJsonFiles)(jsonFiles);
    console.log(`Found ${downloadTasks.length} files to download.`);
    console.log(`Starting downloads (max ${cli_1.argv.concurrency} concurrent)...`);
    await (0, download_1.downloadFiles)(downloadTasks);
    console.log('\nAll files processed and downloaded successfully.');
}
main().catch(console.error);
