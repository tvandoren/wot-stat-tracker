import { Transform } from 'stream';
import { readFile } from 'fs';
import type { Logger } from 'pino';

export class ReadFileStream extends Transform {
  constructor(private logger: Logger) {
    super({ objectMode: true });
  }
  override _transform(
    filePath: string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, data?: { data: Buffer; filePath: string }) => void,
  ) {
    readFile(filePath, (error, data) => {
      if (error) {
        this.logger.error(error, 'Error reading file from ReadFileStream transform', { fileName: filePath });
        callback();
      } else {
        callback(null, { data, filePath });
      }
    });
  }
}

export class JsonifyObjectStream extends Transform {
  constructor(
    private logger: Logger,
    private prettyPrint = false,
  ) {
    super({ objectMode: true });
  }
  override _transform(
    data: unknown,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, stringified?: string) => void,
  ) {
    try {
      callback(null, `${this.prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data)}\n`);
    } catch (error) {
      this.logger.error(error, 'Error stringifying object in JsonifyObjectStream transform', { data });
      callback();
    }
  }
}
