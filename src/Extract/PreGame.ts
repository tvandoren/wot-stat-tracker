import type { JSONSchemaType } from 'ajv';
import type { IPreGameData } from '../types';
import { getLogger } from '../utils/Logger';
import { isValid } from '../utils/Ajv';
import { battleTypeNames } from '../utils/constants';

const logger = getLogger('ExtractPreGame');

// there's limited data that we care about from pregame data, since almost all of the interesting stuff is in the post game results
// what we do care about is server type info that isn't listed later
export const preGameSchema: JSONSchemaType<IPreGameData> = {
  type: 'object',
  properties: {
    serverName: { type: 'string' },
    regionCode: { type: 'string' },
    clientVersions: {
      type: 'object',
      properties: {
        fromExe: { type: 'string', nullable: true },
        fromXml: { type: 'string', nullable: true },
      },
      additionalProperties: false,
    },
    mapName: { type: 'string' },
    mapDisplayName: { type: 'string' },
    gameplayID: { type: 'string' },
    battleTypeCode: { type: 'integer' },
    battleType: { type: 'string', nullable: true },
    uploaderDBID: { type: 'integer' },
  },
  required: ['serverName', 'regionCode', 'mapName', 'mapDisplayName', 'gameplayID'],
  additionalProperties: false,
};

export function getPreGameData(preGame: any, filePath: string): IPreGameData | null {
  if (!preGame || typeof preGame !== 'object') {
    logger.error({ filePath, typeFound: typeof preGame }, 'Pregame data is not an object');
    return null;
  }

  const data = {
    serverName: preGame.serverName,
    regionCode: preGame.regionCode,
    clientVersions: {
      fromExe: preGame.clientVersionFromExe,
      fromXml: preGame.clientVersionFromXml,
    },
    mapName: preGame.mapName,
    mapDisplayName: preGame.mapDisplayName,
    gameplayID: preGame.gameplayID,
    battleTypeCode: preGame.battleType,
    battleType: battleTypeNames.get(preGame.battleType) ?? undefined,
    uploaderDBID: preGame.playerID,
  };

  if (!isValid<IPreGameData>(preGameSchema, data, logger)) {
    return null;
  }

  return data;
}
