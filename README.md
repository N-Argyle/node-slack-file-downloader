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
chmod +x ./index.js
./index.js -d /path/to/directory
```

If no directory is specified, it will use the current working directory.


## Options

- `-d, --dir`: Specify the directory to scan for JSON files (default: current working directory)
- `--help`: Show help information

## How it works

1. [Export your Slack workspace data](https://slack.com/help/articles/201658943-Export-your-workspace-data)
2. The tool recursively scans the specified directory for all JSON files.
3. For each JSON file found, it parses the content and looks for file entries.
4. When it finds a file entry with a `url_private_download`, it downloads the file to the same directory as the JSON file.

## Requirements

- Node.js (version 18 or higher recommended)

## Dependencies

- node-fetch: For downloading files
- glob: For recursive file searching
- yargs: For parsing command-line arguments

## License

This project is licensed under the MIT License.

## Contributing

Feel free to fork. This was a one-off project to quickly download some old Slack workspace files. I don't plan on maintaining it unless I need to use it again.

