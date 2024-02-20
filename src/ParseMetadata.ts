import { Transform, TransformCallback } from 'stream';
import type { IGameMetadata } from './types';
import { getSafe } from './utils';
import { getLogger } from './Logger';

const logger = getLogger({ name: 'ParseMetadata' });

const parsePreGame = (data: unknown) => {
  if (typeof data !== 'object') {
    throw new Error('Invalid preGame data');
  }
  const player = {
    vehicle: getSafe<string>(data, 'playerVehicle', 'string'),
    name: getSafe<string>(data, 'playerName', 'string'),
    id: getSafe<number>(data, 'playerID', 'number'),
  };
  const client = {
    version: getSafe<string>(data, 'clientVersionFromExe', 'string'),
  };
  const server = {
    name: getSafe<string>(data, 'serverName', 'string'),
  }
  logger.info({ player, client, server }, 'Parsing preGame data');
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
