# WoT Stat Tracker

## Description
WoT Stat Tracker is a Node.js application designed to process and analyze World of Tanks replay files. It extracts valuable game data from replay files located in a specified directory, transforms this data into a more readable format, and saves the results for further analysis. In the future, there are plans to support analysis of replays within the application. At the moment the replay output would need to be analyzed by another tool (e.g., uploaded to [S3](https://aws.amazon.com/s3/) and analyzed by [Cribl Search](https://cribl.io/search/))

## Prerequisites
Before you begin, ensure your machine has met the following requirements:
- Node.js is installed.
- A collection of World of Tanks replay files is available (example replay files are included in the repository)

## Installation
Clone the repository to your local machine:
```sh
git clone git@github.com:tvandoren/wot-stat-tracker.git
cd wot-stat-tracker
```
Install the dependencies:
```sh
npm ci
```

## Usage
To start processing replay files, first update `DIR_PATH` in `main.ts` to point to your local replay folder. Then, follow these steps:

1. **Development Mode**: Build and run the application with typescript and eslint checks. Selects one replay file, and pretty-prints the JSON result.
```sh
npm run dev
```

2. **Quick Development Mode**: Build and run the application, skipping typescript and eslint checks. Selects one replay file, and pretty-prints the JSON result.
```sh
npm run quick-dev
```

3. **Production**: Build the application and then start it in production mode. Will attempt to parse all replay files found in `DIR_PATH`.
```sh
npm run build
npm start
```

You can limit the number of files processed by passing an argument:
```sh
node dist/index.js [number_of_files]
```

## Development
To contribute to WoT Stat Tracker, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## Contributors
Thanks to the following people who have contributed to this project:
- Trevor VanDoren (author)

You're welcome to contribute to this project. Please follow the steps in the Development section above.

## License
This project uses the [MIT](LICENSE) license.