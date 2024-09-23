import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { DownloadTask } from './download';

export interface SlackFile {
  url_private_download?: string;
  name: string;
}

export interface SlackMessage {
  files?: SlackFile[];
}

export async function parseJsonFile(filePath: string): Promise<DownloadTask[]> {
  const jsonContent: SlackMessage[] = JSON.parse(await fsPromises.readFile(filePath, 'utf8'));
  if (!Array.isArray(jsonContent)) {
    console.log(`Skipping ${filePath}: Content is not an array`);
    return [];
  }
  const dirPath = path.dirname(filePath);
  return jsonContent.flatMap((message: SlackMessage) => 
    (message.files || [])
      .filter((file: SlackFile) => file.url_private_download)
      .map((file: SlackFile) => ({
        url: file.url_private_download!,
        outputPath: path.join(dirPath, file.name)
      }))
  );
}

export async function parseJsonFiles(jsonFiles: string[]): Promise<DownloadTask[]> {
  const allTasks = await Promise.all(jsonFiles.map(parseJsonFile));
  return allTasks.flat();
}
