import { Transform } from 'stream';
import { getLogger } from './Logger';
import type { IGameData } from './types';

const logger = getLogger({ name: 'ExtractMetadata' });

const INT_SIZE_32 = 4;
const PRE_GAME_INFO_START_INDEX = 12;

function extractReplayMetadata(data: Buffer, filePath: string): IGameData | null {
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

  logger.debug({
    first12Bytes: {
      raw: data.subarray(0, 12),
      first: data.readUInt32LE(0),
      second: data.readUInt32LE(4),
      third: data.readUInt32LE(8),
    },
    serverInfoStartIndex: PRE_GAME_INFO_START_INDEX,
    serverInfoLen: preGameInfoLen,
    serverInfoEndIndex: preGameInfoEndIndex,
    gameInfoLen: postGameInfoLen,
    gameInfoStartIndex: postGameInfoStartIndex,
    gameInfoEndIndex: postGameInfoEndIndex,
  });

  const preGameInfo = data.toString('utf-8', PRE_GAME_INFO_START_INDEX, preGameInfoEndIndex);
  const gameInfo = hasPostGameInfo ? data.toString('utf-8', postGameInfoStartIndex, postGameInfoEndIndex) : undefined;

  try {
    return {
      preGame: JSON.parse(preGameInfo),
      postGame: gameInfo ? JSON.parse(gameInfo) : undefined,
    };
  } catch (err) {
    logger.error(err, 'Error parsing replay metadata', { filePath });
    return null;
  }
}

export class ExtractMetadataToNdjson extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  override _transform(
    { data, filePath }: { data: Buffer; filePath: string },
    _encoding: BufferEncoding,
    callback: () => void,
  ) {
    try {
      const result = extractReplayMetadata(data, filePath);
      if (result) {
        this.push(result);
      }
      callback();
    } catch (error) {
      logger.error(`Error processing file ${filePath}:`, { error });
      callback();
    }
  }
}
