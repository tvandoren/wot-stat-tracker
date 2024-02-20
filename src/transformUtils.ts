import { Transform } from 'stream';
import { readFile } from 'fs';
import { getLogger } from './Logger';

const logger = getLogger({ name: 'transformUtils' });

export const readFileStream = new Transform({
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

export const jsonifyObjectStream = new Transform({
  objectMode: true,
  transform: (data: unknown, _encoding: BufferEncoding, callback) => {
    try {
      callback(null, `${JSON.stringify(data)}\n`);
    } catch (error) {
      logger.error(error, 'Error stringifying object', { data });
      callback();
    }
  },
});
