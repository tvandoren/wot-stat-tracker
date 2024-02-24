import { Transform, TransformCallback } from 'stream';
import type { IGameMetadata, Primitive } from './types';
import { getSafe as getSafeBase } from './utils';
import { getLogger } from './Logger';

const logger = getLogger({ name: 'ParseMetadata', level: 'debug' });
function getSafe<T>(obj: unknown, path: string, expectedType: Primitive): T | undefined {
  return getSafeBase<T>(obj, path, expectedType, logger);
}

const parsePreGame = (data: unknown) => {
  if (typeof data !== 'object') {
    throw new Error('Invalid preGame data');
  }
  const player = {
    vehicle: getSafe<string>(data, 'playerVehicle', 'string'),
    name: getSafe<string>(data, 'playerName', 'string'),
    id: getSafe<number>(data, 'playerID', 'number'),
    clientVersion: getSafe<string>(data, 'clientVersionFromExe', 'string'),
  };
  const server = {
    name: getSafe<string>(data, 'serverName', 'string'),
  };
  logger.info({ player, server }, 'Parsing preGame data');
  return data;
};

const parsePostGame = (data: unknown) => {
  return data;
};

export class ParseMetadata extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  override _transform({ preGame, postGame }: IGameMetadata, _encoding: BufferEncoding, callback: TransformCallback) {
    callback(null, {
      preGame: parsePreGame(preGame),
      postGame: parsePostGame(postGame),
    });
  }
}
