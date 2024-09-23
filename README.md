# Node Slack File Downloader

Node Slack File Downloader is a command-line tool that recursively scans a directory for JSON files exported from Slack and downloads any files referenced in them.

## Installation

You can install this tool globally using npm:
```bash
npm install -g node-slack-file-downloader
npx node-slack-file-downloader -d /path/to/directory
```

Or, if you've cloned the repository:
```bash
pnpm i
pnpm run build
pnpm start -d /path/to/directory
```

If no directory is specified, it will use the current working directory.


## Options

- `-d, --dir`: Specify the directory to scan for JSON files (default: current working directory)
- `-c, --concurrency`: Number of concurrent downloads (default: 3)
- `--help`: Show help information

## Example

```bash
pnpm start -d /path/to/slack/export -c 5
```

This command will scan the `/path/to/slack/export` directory for JSON files and download files with a maximum of 5 concurrent downloads.

## How it works

1. [Export your Slack workspace data](https://slack.com/help/articles/201658943-Export-your-workspace-data)
2. The tool recursively scans the specified directory for all JSON files.
3. For each JSON file found, it parses the content and looks for file entries.
4. When it finds a file entry with a `url_private_download`, it downloads the file to the same directory as the JSON file.
5. Downloads are processed concurrently, with a configurable limit (default 3).
6. Progress bars show the status of individual file downloads and overall progress.

## Requirements

- Node.js (version 18 or higher recommended)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to fork this repository and submit pull requests. While this was initially a one-off project, contributions to improve functionality or fix bugs are welcome.

