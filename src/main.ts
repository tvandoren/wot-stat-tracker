import { readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable, PassThrough } from 'stream';
import { getLogger } from './utils/Logger';
import { JsonifyObjectStream, ReadFileStream } from './utils/Transform';
import { pluralize } from './utils';
import { replayExtractor, gameDataExtractor } from './Extract';

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-extraneous-dependencies
  require('source-map-support').install(); // enable source maps for stack traces
}

const DIR_PATH = 'C:\\Games\\World_of_Tanks_NA\\replays';
const logger = getLogger('main');

(async function main() {
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
  if (limit) {
    fileNames = fileNames.slice(0, limit);
    logger.info(`Limiting processing to the first ${limit} ${pluralize('file', limit)}.`);
    logger.info('Writing unmodified replay data to dist/unmodified.json');
    const unmodifiedWriteStream = createWriteStream('dist/unmodified.json');
    passthrough.on('data', (data) => unmodifiedWriteStream.write(JSON.stringify(data, null, 2)));
  }

  const readFileStream = new ReadFileStream(logger);
  const jsonifyObjectStream = new JsonifyObjectStream(logger, Boolean(limit)); // pretty print if it's a limited run
  const writeStream = createWriteStream('dist/parsedReplays.json');
  Readable.from(fileNames.map((file) => `${DIR_PATH}\\${file}`))
    .pipe(readFileStream)
    .pipe(replayExtractor)
    .pipe(passthrough)
    .pipe(gameDataExtractor)
    .pipe(jsonifyObjectStream)
    .pipe(writeStream)
    .on('error', (error) => logger.error(error, 'Error processing replay pipeline.'))
    .on('finish', () => logger.info('Finished processing replays.'));
})().catch((error) => logger.error(error, 'Error processing replays.'));
