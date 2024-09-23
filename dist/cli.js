"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.argv = void 0;
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
exports.argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
