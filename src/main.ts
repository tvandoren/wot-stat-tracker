import { readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable, PassThrough } from 'stream';
import path from 'path';
import { getLogger } from './utils/Logger';
import { JsonifyObjectStream, ReadFileStream } from './utils/Transform';
import { generateRandomCharacters, pluralize } from './utils';
import { replayExtractor, GameDataExtractor } from './Extract';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
  require('source-map-support').install(); // enable source maps for stack traces
}

// const DIR_PATH = 'C:\\Games\\World_of_Tanks_NA\\replays';
const DIR_PATH = path.join(__dirname, '..', 'replays');
const logger = getLogger('main');

async function main() {
  let fileNames: string[] = [];
  try {
    fileNames = await readdir(DIR_PATH);
  } catch (error) {
    logger.error(error, 'Error writing output file.');
  }
  if (!fileNames.length) {
    logger.info('No files found in the directory');
    return;
  }
  logger.info(`Found ${fileNames.length} files in the replay directory (${DIR_PATH}).`);

  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;

  const passthrough = new PassThrough({ objectMode: true });
  let uniqueness = `-${generateRandomCharacters(6)}`;
  if (limit) {
    fileNames = fileNames.slice(0, limit);
    logger.info(`Limiting processing to the first ${limit} ${pluralize('file', limit)}.`);
    logger.info('Writing unmodified replay data to dist/unmodified.json');
    const unmodifiedWriteStream = createWriteStream('dist/unmodified.json');
    passthrough.on('data', (data) => unmodifiedWriteStream.write(JSON.stringify(data, null, 2)));
    // don't need to generate a unique identifier for the limited run
    uniqueness = '';
  }

  const readFileStream = new ReadFileStream(logger);
  const gameDataExtractor = new GameDataExtractor(
    createWriteStream(`dist/personalResults${uniqueness}.json`),
    Boolean(limit),
  );
  const jsonifyObjectStream = new JsonifyObjectStream(logger, Boolean(limit)); // pretty print if it's a limited run
  const writeStream = createWriteStream(`dist/parsedReplays${uniqueness}.json`);
  Readable.from(fileNames.map((file) => `${DIR_PATH}\\${file}`))
    .pipe(readFileStream)
    .pipe(replayExtractor)
    .pipe(passthrough)
    .pipe(gameDataExtractor)
    .pipe(jsonifyObjectStream)
    .pipe(writeStream)
    .on('error', (error) => logger.error(error, 'Error processing replay pipeline.'))
    .on('finish', () => {
      logger.info('Finished processing replays.');
      writeStream.end();
    });
}
main().catch((error) => logger.error(error, 'Error processing replays.'));
