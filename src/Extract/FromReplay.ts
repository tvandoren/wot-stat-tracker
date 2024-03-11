import { Transform } from 'stream';
import type { IGameMetadata } from '../types';
import { getLogger } from '../utils/Logger';

const logger = getLogger('ExtractFromReplay');

const INT_SIZE_32 = 4;
const PRE_GAME_INFO_START_INDEX = 12;

export class ReplayExtractor extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  override _transform(
    { data, filePath }: { data: Buffer; filePath: string },
    _encoding: BufferEncoding,
    callback: (error?: Error | null, gameData?: IGameMetadata) => void,
  ) {
    try {
      if (!data.length) {
        logger.debug('skipping empty file');
        callback();
        return;
      }

      const numChunks = data.readUInt32LE(4);
      if ([1, 2].indexOf(numChunks) === -1) {
        throw new Error(`Invalid number of chunks: ${numChunks}`);
      }
      // if you didn't stay in the battle until the end, final results will not be available
      const hasPostGameInfo = numChunks === 2;
      const preGameInfoLen = data.readUInt32LE(PRE_GAME_INFO_START_INDEX - INT_SIZE_32);
      const preGameInfoEndIndex = PRE_GAME_INFO_START_INDEX + preGameInfoLen;
      const postGameInfoLen = data.readUInt32LE(PRE_GAME_INFO_START_INDEX + preGameInfoLen);
      const postGameInfoStartIndex = preGameInfoEndIndex + INT_SIZE_32;
      const postGameInfoEndIndex = postGameInfoStartIndex + postGameInfoLen;

      const preGameInfo = data.toString('utf-8', PRE_GAME_INFO_START_INDEX, preGameInfoEndIndex);
      const gameInfo = hasPostGameInfo
        ? data.toString('utf-8', postGameInfoStartIndex, postGameInfoEndIndex)
        : undefined;

      callback(null, {
        filePath,
        preGame: JSON.parse(preGameInfo),
        postGame: gameInfo ? JSON.parse(gameInfo) : undefined,
      });
    } catch (error) {
      logger.error(error, `Error processing file ${filePath}:`);
      callback(error);
    }
  }
}
