import type { JSONSchemaType } from 'ajv';
import { Transform } from 'stream';
import type { WriteStream } from 'fs';
import type { IGameData, IGameMetadata, IPersonalResultData } from '../types';
import { ReplayExtractor } from './FromReplay';
import { getPreGameData, preGameSchema } from './PreGame';
import { getLogger } from '../utils/Logger';
import { getPlayerResult } from './UploaderInfo';
import { getPlayersByDBID } from './Players';
import { validate } from '../utils/Ajv';
import { BattleType, battleTypeNames } from '../utils/constants';

const logger = getLogger('ExtractGameData');

export const replayExtractor = new ReplayExtractor();

const gameDataSchema: JSONSchemaType<Omit<IGameData, 'playerInfo'>> = {
  type: 'object',
  properties: {
    ...preGameSchema.properties,
    arenaUniqueID: { type: 'integer' },
    finishReason: { type: 'integer' },
    arenaCreateTime: { type: 'integer' },
    winningTeam: { type: 'integer' },
    teamHealth: { type: 'object', additionalProperties: { type: 'integer' } } as JSONSchemaType<{
      [key: string]: number;
    }>,
    arenaTypeID: { type: 'integer' },
    duration: { type: 'number' },
  },
  required: [
    ...preGameSchema.required,
    'arenaUniqueID',
    'finishReason',
    'arenaCreateTime',
    'winningTeam',
    'arenaTypeID',
    'duration',
  ],
  additionalProperties: false,
};

export class GameDataExtractor extends Transform {
  private unknownBattleTypes = new Set<number>();
  constructor(
    private personalResultWriteStream: WriteStream,
    private prettyPrint: boolean,
  ) {
    super({ objectMode: true });
  }

  override _transform(
    { preGame, postGame, filePath }: IGameMetadata,
    _encoding: BufferEncoding,
    callback: (error?: Error | null, data?: IGameData) => void,
  ): void {
    if (!preGame) {
      logger.warn({ filePath }, 'Skipping file due to missing post game data');
      callback();
      return;
    }
    if (!postGame) {
      // expected to drop any game that the player didn't stay until the end for
      callback();
      return;
    }
    const parsedPreGame = getPreGameData(preGame, filePath);
    if (parsedPreGame?.battleTypeCode === BattleType.TRAINING) {
      // don't care about training battles for stats
      callback();
      return;
    }
    if (parsedPreGame?.battleType && !battleTypeNames.get(parsedPreGame.battleTypeCode)) {
      this.unknownBattleTypes.add(parsedPreGame.battleTypeCode);
    }
    const generalInfo = postGame[0];
    const playerInfo = postGame[1] as Record<string, unknown>;
    if (!parsedPreGame || !generalInfo || !playerInfo) {
      logger.warn(
        {
          filePath,
          hasPreGame: Boolean(parsedPreGame),
          hasGeneralInfo: Boolean(generalInfo),
          hasPlayerInfo: Boolean(playerInfo),
        },
        'Missing necessary data when parsing replay results',
      );
      callback();
      return;
    }
    const dbidBySessionID = new Map<string, { dbid: number; vehicleType: string }>();
    Object.keys(generalInfo.vehicles).forEach((sessionID) => {
      const dbid = (generalInfo.vehicles[sessionID]?.[0] as Record<string, unknown>)?.accountDBID ?? Number(sessionID); // before anonymizer, sessionID would be the dbid
      const vehicleType = (playerInfo[sessionID] as Record<string, unknown>)?.vehicleType;
      if (dbid && vehicleType && typeof dbid === 'number' && typeof vehicleType === 'string') {
        dbidBySessionID.set(sessionID, { dbid, vehicleType });
      } else {
        logger.warn({ sessionID, dbid, vehicleType }, 'Creating data map for player failed');
      }
    });

    const resultsByPlayer = getPlayersByDBID(generalInfo, playerInfo, filePath);

    const baseUploaderResult = resultsByPlayer[parsedPreGame.uploaderDBID];
    if (baseUploaderResult) {
      const { battleResult: _unused, ...baseInfo } = baseUploaderResult;
      // flesh out and spin off to save separately
      const playerResult = getPlayerResult(generalInfo.personal, baseInfo, dbidBySessionID, filePath);
      if (playerResult) {
        const fullPlayerResult: IPersonalResultData = {
          ...parsedPreGame,
          ...playerResult,
        };
        this.personalResultWriteStream.write(
          this.prettyPrint ? `${JSON.stringify(fullPlayerResult, null, 2)}\n` : `${JSON.stringify(fullPlayerResult)}\n`,
        );
      }
    }

    const commonGameInfo = {
      arenaCreateTime: generalInfo.common.arenaCreateTime,
      ...parsedPreGame,
      arenaUniqueID: generalInfo.arenaUniqueID,
      finishReason: generalInfo.common.finishReason,
      winningTeam: generalInfo.common.winnerTeam,
      teamHealth: generalInfo.common.teamHealth,
      arenaTypeID: generalInfo.common.arenaTypeID,
      duration: generalInfo.common.duration,
    };
    const parsedPlayerInfo = Object.entries(resultsByPlayer).map(([dbid, result]) => ({
      accountDBID: Number(dbid),
      ...result,
    }));
    if (validate<IGameData>(gameDataSchema, commonGameInfo, logger)) {
      callback(null, { ...commonGameInfo, playerInfo: parsedPlayerInfo });
    } else {
      logger.warn({ filePath }, 'No data extracted from file');
      callback();
    }
  }

  override _final(callback: (error?: Error | null) => void): void {
    if (this.unknownBattleTypes.size) {
      logger.warn({ unknownBattleTypes: Array.from(this.unknownBattleTypes) }, 'Unknown battle types found in replays');
    }
    this.personalResultWriteStream.end();
    callback();
  }
}
