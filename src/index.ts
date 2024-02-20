import { readdir } from 'fs/promises';
import { createWriteStream, readFile } from 'fs';
import { Readable, Transform } from 'stream';
import { getLogger } from './Logger';
import { ExtractMetadataToNdjson } from './ExtractMetadata';

const DIR_PATH = 'C:\\Games\\World_of_Tanks_NA\\replays';
const logger = getLogger();

const readFileTransform = new Transform({
  objectMode: true,
  transform: (filePath: string, _encoding: BufferEncoding, callback) => {
    readFile(filePath, (error, data) => {
      if (error) {
        logger.error(error, 'Error reading file', { fileName: filePath });
        callback();
      } else {
        callback(null, { data, filePath });
      }
    });
  },
});

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
  } else {
    logger.info(`Found ${fileNames.length} files in the replay directory (${DIR_PATH}).`)
  }
  const extractMetadata = new ExtractMetadataToNdjson();
  const writeStream = createWriteStream('dist/parsedReplays.json');
  Readable.from(fileNames.map((file) => `${DIR_PATH}\\${file}`))
    .pipe(readFileTransform)
    .pipe(extractMetadata)
    .pipe(writeStream)
    .on('error', (error) => logger.error(error, 'Error processing replay pipeline.'))
    .on('finish', () => logger.info('Finished processing replays.'));
})().catch((error) => logger.error(error, 'Error processing replays.'));
