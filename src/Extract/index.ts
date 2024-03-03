import { Transform } from 'stream';
import type { IGameData, IGameMetadata } from '../types';
import { ReplayExtractor } from './FromReplay';
import { getPreGameData } from './PreGame';
import { getPostGameData } from './PostGame';
import { getLogger } from '../utils/Logger';
import { getPlayerResult } from './PlayerResult';

const logger = getLogger('ExtractGameData');

export const replayExtractor = new ReplayExtractor();
export const gameDataExtractor = new Transform({
  objectMode: true,
  transform({ preGame, postGame, filePath }: IGameMetadata, _encoding, callback) {
    if (!preGame || !postGame) {
      logger.warn(
        { filePath, hasPreGame: Boolean(preGame), hasPostGame: Boolean(postGame) },
        'Skipping file due to missing data',
      );
      callback();
      return;
    }
    const parsedPreGame = getPreGameData(preGame, filePath);
    const generalInfo = postGame[0];
    if (!generalInfo) {
      logger.warn({ filePath }, 'No general info found in post game data');
      callback();
      return;
    }
    const accountIdByAvatarId = new Map<string, number>();
    Object.keys(generalInfo.vehicles).forEach((avatarId) => {
      const vehicleData = generalInfo.vehicles[avatarId]?.[0] as Record<string, unknown>;
      const dbid = vehicleData?.accountDBID as number;
      if (dbid) {
        accountIdByAvatarId.set(avatarId, dbid);
      }
    });

    const parsedPostGame = getPostGameData(postGame, filePath);
    const playerResult = getPlayerResult(generalInfo.personal, preGame.playerVehicle, accountIdByAvatarId, filePath);
    const result: IGameData = {};
    if (parsedPreGame && parsedPostGame) {
      result.gameResults = { ...parsedPreGame, ...parsedPostGame };
    }
    if (playerResult) {
      result.playerResults = playerResult;
    }
    if (Object.keys(result).length) {
      this.push(result);
    } else {
      logger.warn({ filePath }, 'No data extracted from file');
    }
    callback();
  },
});
