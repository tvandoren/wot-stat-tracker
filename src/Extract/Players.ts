import type { JSONSchemaType } from 'ajv';
import type { IBasePlayerInfo, IPlayerInfo, IGeneralInfo } from '../types';
import { getLogger } from '../utils/Logger';
import { validate } from '../utils/Ajv';
import { getIndividualResult } from './IndividualResult';

const logger = getLogger('ExtractPlayers');

const playerSchema: JSONSchemaType<IBasePlayerInfo> = {
  type: 'object',
  properties: {
    vehicleType: { type: 'string' },
    team: { type: 'number' },
    realName: { type: 'string' },
    fakeName: { type: 'string', nullable: true },
    sessionID: { type: 'string' },
    clanDBID: { type: 'number', nullable: true },
  },
  required: ['vehicleType', 'team', 'realName', 'sessionID'],
  additionalProperties: false,
};

export const getPlayersByDBID = (
  { players, vehicles }: IGeneralInfo,
  playerInfoBySessionID: any,
  filePath: string,
): Record<string, IPlayerInfo> => {
  return Object.keys(vehicles).reduce((acc: Record<string, IPlayerInfo>, sessionID) => {
    let vehicleData = vehicles[sessionID];
    // may be an array or an object (guessing array was introduced for frontline, but just a guess)
    if (Array.isArray(vehicleData)) {
      vehicleData = vehicleData[0];
    }
    if (!vehicleData) {
      logger.warn({ sessionID, filePath }, 'No vehicle data found for player');
      return acc;
    }
    const dbid = (vehicleData?.accountDBID as number) || sessionID; // before anonymizer, sessionID is the dbid (or so it seems)
    if (!dbid) {
      logger.warn({ avatarId: sessionID, filePath }, 'No accountDBID found for player');
      return acc;
    }
    const baseInfo = {
      ...playerInfoBySessionID[sessionID],
      ...players[dbid],
      sessionID,
    };
    if (!baseInfo.realName && baseInfo.name) {
      baseInfo.realName = baseInfo.name; // before anonymizer, name is the realName
    }
    if (!validate<IBasePlayerInfo>(playerSchema, baseInfo, logger, true)) {
      // logging covered in validate function
      return acc;
    }
    acc[dbid] = {
      ...baseInfo,
      battleResult: getIndividualResult({ ...vehicleData, sessionID }, logger),
    };

    return acc;
  }, {});
};
