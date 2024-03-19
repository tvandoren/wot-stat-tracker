import { Writable } from 'stream';
import { createWriteStream } from 'fs';
import type { IGameData } from '../types';
import { generateRandomCharacters } from '../utils/utils';
import { getLogger } from '../utils/Logger';

const logger = getLogger('WriteResults');

export class WriteResults extends Writable {
  private writeStreams: Map<string, NodeJS.WritableStream> = new Map();
  private collisionAvoidanceString: string;
  constructor(
    private prettyPrint = false,
    useCollisionAvoidance = false,
  ) {
    super({ objectMode: true });
    this.collisionAvoidanceString = useCollisionAvoidance ? `-${generateRandomCharacters(6)}` : '';
  }

  override _write(chunk: IGameData, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    const { battleType } = chunk;
    const writeKey = battleType ?? 'unknownBattleType';

    // Determine the file path based on the content of the data
    let writeStream = this.writeStreams.get(writeKey);
    if (!writeStream) {
      writeStream = createWriteStream(`dist/${writeKey}${this.collisionAvoidanceString}.json`);
      this.writeStreams.set(writeKey, writeStream);
    }

    const content = `${this.prettyPrint ? JSON.stringify(chunk, null, 2) : JSON.stringify(chunk)}\n`;
    writeStream.write(content, 'utf-8', callback);
  }

  override _final(callback: (error?: Error | null) => void) {
    try {
      this.writeStreams.forEach((stream) => stream.end());
      this.writeStreams.clear();
      callback();
    } catch (error) {
      logger.error(error, 'Error closing write streams');
      callback(error);
    }
  }
}
