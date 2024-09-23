import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import stream from 'stream';
import { promisify } from 'util';
import { argv } from './cli';

const pipeline = promisify(stream.pipeline);

export interface DownloadTask {
  url: string;
  outputPath: string;
}

export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  await pipeline(response.body, fs.createWriteStream(outputPath));
}

export async function downloadFiles(downloadTasks: DownloadTask[]): Promise<void> {
  const limit = pLimit(argv.concurrency as number);
  const multiBar = new cliProgress.MultiBar({
    format: 'Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || {filename}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  }, cliProgress.Presets.shades_classic);

  const bars = Array.from({ length: argv.concurrency }, () => multiBar.create(100, 0));
  const barAssignments = new Map<string, cliProgress.SingleBar>();

  const downloadPromises = downloadTasks.map((task, index) => limit(async () => {
    const bar = bars[index % argv.concurrency];
    barAssignments.set(task.outputPath, bar);

    try {
      await downloadFileWithProgress(task.url, task.outputPath, bar);
    } catch (error) {
      console.error(`Error downloading ${task.outputPath}: ${(error as Error).message}`);
    }
  }));

  await Promise.all(downloadPromises);
  multiBar.stop();
}

async function downloadFileWithProgress(url: string, outputPath: string, bar: cliProgress.SingleBar): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const totalSize = parseInt(response.headers.get('content-length') || '0', 10);
  let downloadedSize = 0;

  response.body.on('data', (chunk: Buffer) => {
    downloadedSize += chunk.length;
    bar.update((downloadedSize / totalSize) * 100, { filename: path.basename(outputPath) });
  });

  await pipeline(response.body, fs.createWriteStream(outputPath));
}
