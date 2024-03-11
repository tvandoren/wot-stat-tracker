import type { JSONSchemaType } from 'ajv';
import type { IPreGameData } from '../types';
import { getLogger } from '../utils/Logger';
import { isValid } from '../utils/Ajv';

const logger = getLogger('ExtractPreGame');

// there's limited data that we care about from pregame data, since almost all of the interesting stuff is in the post game results
// what we do care about is server type info that isn't listed later
const preGameSchema: JSONSchemaType<IPreGameData> = {
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
    gameplayID: { type: 'string' },
    battleType: { type: 'integer' },
    uploaderDBID: { type: 'integer' },
  },
  required: ['serverName', 'regionCode', 'mapName', 'gameplayID'],
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
    gameplayID: preGame.gameplayID,
    battleType: preGame.battleType,
    uploaderDBID: preGame.playerID,
  };

  if (!isValid<IPreGameData>(preGameSchema, data, logger)) {
    return null;
  }

  return data;
}
