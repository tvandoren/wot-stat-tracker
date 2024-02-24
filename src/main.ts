import { readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { getLogger } from './Logger';
import { ExtractMetadata } from './ExtractMetadata';
import { JsonifyObjectStream, ReadFileStream } from './transformUtils';
import { ParseMetadata } from './ParseMetadata';
import { pluralize } from './utils';

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
  if (limit) {
    fileNames = fileNames.slice(0, limit);
    logger.info(`Limiting processing to the first ${limit} ${pluralize('file', limit)}.`);
  }

  const readFileStream = new ReadFileStream(logger);
  const extractMetadata = new ExtractMetadata();
  const parseMetadata = new ParseMetadata();
  const jsonifyObjectStream = new JsonifyObjectStream(logger, Boolean(limit)); // pretty print if it's a limited run
  const writeStream = createWriteStream('dist/parsedReplays.json');
  Readable.from(fileNames.map((file) => `${DIR_PATH}\\${file}`))
    .pipe(readFileStream)
    .pipe(extractMetadata)
    .pipe(parseMetadata)
    .pipe(jsonifyObjectStream)
    .pipe(writeStream)
    .on('error', (error) => logger.error(error, 'Error processing replay pipeline.'))
    .on('finish', () => logger.info('Finished processing replays.'));
})().catch((error) => logger.error(error, 'Error processing replays.'));
