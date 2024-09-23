"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonFiles = exports.parseJsonFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
async function parseJsonFile(filePath) {
    const jsonContent = JSON.parse(await fs_1.promises.readFile(filePath, 'utf8'));
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
exports.parseJsonFile = parseJsonFile;
async function parseJsonFiles(jsonFiles) {
    const allTasks = await Promise.all(jsonFiles.map(parseJsonFile));
    return allTasks.flat();
}
exports.parseJsonFiles = parseJsonFiles;
