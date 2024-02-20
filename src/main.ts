import { readdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { getLogger } from './Logger';
import { ExtractMetadataToNdjson } from './ExtractMetadata';
import { jsonifyObjectStream, readFileStream } from './transformUtils';

const DIR_PATH = 'C:\\Games\\World_of_Tanks_NA\\replays';
const logger = getLogger({ name: 'main' });

(async function main() {
  let fileNames: string[] = [];
  try {
    fileNames = await readdir(DIR_PATH);
  } catch (error) {
    logger.error('Error writing output file.', { error });
  }
  if (!fileNames.length) {
    logger.info('No files found in the directory');
    return;
  }
  logger.info(`Found ${fileNames.length} files in the replay directory (${DIR_PATH}).`);

  const extractMetadata = new ExtractMetadataToNdjson();
  const writeStream = createWriteStream('dist/parsedReplays.json');
  Readable.from(fileNames.map((file) => `${DIR_PATH}\\${file}`))
    .pipe(readFileStream)
    .pipe(extractMetadata)
    .pipe(jsonifyObjectStream)
    .pipe(writeStream)
    .on('error', (error) => logger.error(error, 'Error processing replay pipeline.'))
    .on('finish', () => logger.info('Finished processing replays.'));
})().catch((error) => logger.error(error, 'Error processing replays.'));
