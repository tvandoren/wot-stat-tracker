import type { JSONSchemaType } from 'ajv';
import type { IBasePlayerInfo, IPlayerInfo, IGeneralInfo } from '../types';
import { getLogger } from '../utils/Logger';
import { validateAndRemoveAdditionalProperties } from '../utils/Ajv';
import { getIndividualResult } from './IndividualResult';

const logger = getLogger('ExtractPlayers');

const playerSchema: JSONSchemaType<IBasePlayerInfo> = {
  type: 'object',
  properties: {
    vehicleType: { type: 'string' },
    team: { type: 'number' },
    realName: { type: 'string' },
    fakeName: { type: 'string' },
    sessionID: { type: 'string' },
    clanDBID: { type: 'number', nullable: true },
  },
  required: ['vehicleType', 'team', 'realName', 'fakeName', 'sessionID'],
  additionalProperties: false,
};

export const getPlayersByDBID = (
  { players, vehicles }: IGeneralInfo,
  playerInfoBySessionID: any,
  filePath: string,
): Record<string, IPlayerInfo> => {
  return Object.keys(vehicles).reduce((acc: Record<string, IPlayerInfo>, sessionID) => {
    const vehicleData = vehicles[sessionID]?.[0] as Record<string, unknown>;
    const dbid = vehicleData?.accountDBID as number;
    if (!dbid) {
      logger.warn({ avatarId: sessionID, filePath }, 'No accountDBID found for player');
      return acc;
    }
    const baseInfo = {
      ...playerInfoBySessionID[sessionID],
      ...players[dbid],
      sessionID,
    };
    if (!validateAndRemoveAdditionalProperties<IBasePlayerInfo>(playerSchema, baseInfo, logger)) {
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
