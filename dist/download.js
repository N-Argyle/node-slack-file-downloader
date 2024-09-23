"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFiles = exports.downloadFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const p_limit_1 = __importDefault(require("p-limit"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const stream_1 = __importDefault(require("stream"));
const util_1 = require("util");
const cli_1 = require("./cli");
const pipeline = (0, util_1.promisify)(stream_1.default.pipeline);
async function downloadFile(url, outputPath) {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    await pipeline(response.body, fs_1.default.createWriteStream(outputPath));
}
exports.downloadFile = downloadFile;
async function downloadFiles(downloadTasks) {
    const limit = (0, p_limit_1.default)(cli_1.argv.concurrency);
    const multiBar = new cli_progress_1.default.MultiBar({
        format: 'Progress |' + ansi_colors_1.default.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || {filename}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    }, cli_progress_1.default.Presets.shades_classic);
    const bars = Array.from({ length: cli_1.argv.concurrency }, () => multiBar.create(100, 0));
    const barAssignments = new Map();
    const downloadPromises = downloadTasks.map((task, index) => limit(async () => {
        const bar = bars[index % cli_1.argv.concurrency];
        barAssignments.set(task.outputPath, bar);
        try {
            await downloadFileWithProgress(task.url, task.outputPath, bar);
        }
        catch (error) {
            console.error(`Error downloading ${task.outputPath}: ${error.message}`);
        }
    }));
    await Promise.all(downloadPromises);
    multiBar.stop();
}
exports.downloadFiles = downloadFiles;
async function downloadFileWithProgress(url, outputPath, bar) {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
        downloadedSize += chunk.length;
        bar.update((downloadedSize / totalSize) * 100, { filename: path_1.default.basename(outputPath) });
    });
    await pipeline(response.body, fs_1.default.createWriteStream(outputPath));
}
