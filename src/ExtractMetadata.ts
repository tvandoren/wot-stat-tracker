import { Transform, type TransformCallback } from 'stream';
import { getLogger } from './Logger';
import type { IGameMetadata } from './types';

const logger = getLogger('ExtractMetadata');

const INT_SIZE_32 = 4;
const PRE_GAME_INFO_START_INDEX = 12;

function extractReplayMetadata(data: Buffer, filePath: string): IGameMetadata | null {
  if (!data.length) {
    logger.debug('skipping empty file');
    return null;
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
  const gameInfo = hasPostGameInfo ? data.toString('utf-8', postGameInfoStartIndex, postGameInfoEndIndex) : undefined;

  try {
    return {
      filePath,
      preGame: JSON.parse(preGameInfo),
      postGame: gameInfo ? JSON.parse(gameInfo) : undefined,
    };
  } catch (err) {
    logger.error(err, 'Error parsing replay metadata', { filePath });
    return null;
  }
}

export class ExtractMetadata extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  override _transform(
    { data, filePath }: { data: Buffer; filePath: string },
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    try {
      const result = extractReplayMetadata(data, filePath);
      if (result) {
        this.push(result);
      }
      callback();
    } catch (error) {
      logger.error(error, `Error processing file ${filePath}:`);
      callback();
    }
  }
}
