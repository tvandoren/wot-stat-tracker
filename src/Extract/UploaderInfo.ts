import type { JSONSchemaType } from 'ajv';
import type { IBasePlayerInfo, IResultByEnemyVehicle, IUploaderInfo } from '../types';
import { getLogger } from '../utils/Logger';
import { validateAndRemoveAdditionalProperties } from '../utils/Ajv';
import { getUploaderResult } from './IndividualResult';

const logger = getLogger('ExtractPlayerResult');

interface IUnstructuredResult {
  crits?: number; // TODO: figure out what the number here actually means
  damageAssistedRadio?: number; // TODO: rename these for consistency
  damageAssistedStun?: number;
  damageAssistedTrack?: number;
  damageBlockedByArmor?: number;
  damageDealt?: number;
  damageReceived?: number; // TODO: damage received from this player?
  directEnemyHits?: number;
  directHits?: number;
  explosionHits?: number; // TODO: HE shell damage?
  fire?: number; // TODO: rename maybe? Damage done by fire
  noDamageDirectHitsReceived?: number;
  piercingEnemyHits?: number; // TODO: how does this differ from piercings?
  piercings?: number;
  rickochetsReceived?: number; // TODO: correct typo here
  spotted?: number;
  stunDuration?: number; // TODO: figure out if this is useful
  stunNum?: number; // TODO: verify what this actually tracks
  targetKills?: number; // TODO: rename to kills?
}

const enemyVehicleSchema: JSONSchemaType<IUnstructuredResult> = {
  type: 'object',
  properties: {
    crits: { type: 'number', nullable: true }, // erm... figure out what the number here actually means
    damageAssistedRadio: { type: 'number', nullable: true }, // TODO: rename these for consistency
    damageAssistedStun: { type: 'number', nullable: true },
    damageAssistedTrack: { type: 'number', nullable: true },
    damageBlockedByArmor: { type: 'number', nullable: true },
    damageDealt: { type: 'number', nullable: true },
    damageReceived: { type: 'number', nullable: true }, // TODO: damage received from this player?
    directEnemyHits: { type: 'number', nullable: true },
    directHits: { type: 'number', nullable: true },
    explosionHits: { type: 'number', nullable: true }, // TODO: HE shell damage?
    fire: { type: 'number', nullable: true }, // TODO: rename maybe? Damage done by fire
    noDamageDirectHitsReceived: { type: 'number', nullable: true },
    piercingEnemyHits: { type: 'number', nullable: true }, // TODO: how does this differ from piercings?
    piercings: { type: 'number', nullable: true },
    rickochetsReceived: { type: 'number', nullable: true }, // TODO: rename to ricochetsReceived. Also, good ole rick :P
    spotted: { type: 'number', nullable: true },
    stunDuration: { type: 'number', nullable: true }, // TODO: figure out if this is useful
    stunNum: { type: 'number', nullable: true }, // TODO: verify what this actually tracks
    targetKills: { type: 'number', nullable: true }, // TODO: rename to kills?
  },
  additionalProperties: false, // TODO: switch to false when removing additional properties
};

function structureEnemyInteraction(
  unstructured: IUnstructuredResult,
): Omit<IResultByEnemyVehicle, 'dbid' | 'vehicleType'> {
  return {
    critsInflicted: unstructured.crits, // TODO: figure out how to turn this into useable data
    directHits: unstructured.directHits,
    explosionHits: unstructured.explosionHits,
    fireDamage: unstructured.fire,
    gotKill: Boolean(unstructured.targetKills),
    piercingHits: unstructured.piercingEnemyHits,
    stunCount: unstructured.stunNum,
    totalDamageDealt: unstructured.damageDealt,
    totalStunDuration: unstructured.stunDuration,
    damageAssistedRadio: unstructured.damageAssistedRadio,
    damageAssistedStun: unstructured.damageAssistedStun,
    damageAssistedTrack: unstructured.damageAssistedTrack,
    gotInitialSpot: Boolean(unstructured.spotted),
    damageBlockedByArmor: unstructured.damageBlockedByArmor,
    ricochetsReceived: unstructured.rickochetsReceived, // rickochet was a typo in the original data
    noDamageDirectHitsReceived: unstructured.noDamageDirectHitsReceived,
  };
}

export function getPlayerResult(
  personal: any,
  baseInfo: IBasePlayerInfo,
  dbidBySessionID: Map<string, { dbid: number; vehicleType: string }>,
  filePath: string,
): IUploaderInfo | undefined {
  if (!personal || typeof personal !== 'object') {
    logger.error({ filePath, typeFound: typeof personal }, 'Personal data is not an object');
    return undefined;
  }
  const personalKeys = Object.keys(personal);
  if (personalKeys.length !== 2) {
    logger.warn(
      { filePath, keys: personalKeys },
      'Found personal data with more than 2 keys - investigate for additional info',
    );
    return undefined; // TODO: eventually support frontline
    // some files found with this... likely for frontline?
    // C:\Games\World_of_Tanks_NA\replays\20240220_1902_france-F116_Bat_Chatillon_Bourrasque_208_bf_epic_normandy.wotreplay,"keys":["45841","60209","60225","60529","avatar"]
    // C:\Games\World_of_Tanks_NA\replays\20240220_1931_czech-Cz20_ShPTK_TVP_100_mm_209_wg_epic_suburbia.wotreplay,"keys":["45841","60209","60529","62273","avatar"]
    // C:\Games\World_of_Tanks_NA\replays\20240220_1958_china-Ch47_BZ_176_209_wg_epic_suburbia.wotreplay,"keys":["45841","60209","60225","60529","avatar"]
    // C:\Games\World_of_Tanks_NA\replays\20240220_2019_china-Ch47_BZ_176_209_wg_epic_suburbia.wotreplay,"keys":["45841","60209","60529","avatar"]
    // C:\Games\World_of_Tanks_NA\replays\20240220_2033_china-Ch47_BZ_176_209_wg_epic_suburbia.wotreplay,"keys":["45841","60209","60225","62545","avatar"]
  }
  const dataKey = personalKeys.find((key) => Number.isInteger(Number(key)));
  if (!dataKey) {
    logger.error({ filePath, keys: personalKeys }, 'Personal data does not contain a number key');
    return undefined;
  }
  const { [dataKey]: personalResults } = personal; // TODO: handle frontline

  const byEnemyVehicle: IResultByEnemyVehicle[] = [];
  Object.keys(personalResults.details).forEach((malformedId) => {
    const enemySessionID = malformedId.match(/\d+/)?.[0];
    const { dbid, vehicleType } = (enemySessionID && dbidBySessionID.get(enemySessionID)) || {};
    const unstructured = structuredClone(personalResults.details[malformedId]);
    const isValid = validateAndRemoveAdditionalProperties<IUnstructuredResult>(
      enemyVehicleSchema,
      unstructured,
      logger,
    );
    if (dbid && vehicleType && isValid) {
      byEnemyVehicle.push({
        dbid,
        vehicleType,
        ...structureEnemyInteraction(unstructured),
      });
    } else if (!dbid || !vehicleType) {
      logger.warn({ enemySessionID, dbid, vehicleType }, 'No dbid or vehicleType found for enemy vehicle');
    }
  });
  const battleResult = getUploaderResult({ ...personalResults, sessionID: baseInfo.sessionID }, logger);

  if (battleResult) {
    return {
      ...baseInfo,
      battleResult,
      byEnemyVehicle,
    };
  }
  return undefined;
}
