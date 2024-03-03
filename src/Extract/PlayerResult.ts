import type { JSONSchemaType } from 'ajv';
import type { IPlayerResult, IResultsByEnemyVehicle } from '../types';
import { getLogger } from '../utils/Logger';
import { validateAndRemoveAdditionalProperties } from '../utils/Ajv';

const logger = getLogger('ExtractPlayerResult');

const playerResultSchema: JSONSchemaType<IPlayerResult> = {
  type: 'object',
  properties: {
    accountInfo: {
      type: 'object',
      properties: {
        accountDBID: { type: 'number' },
        clanDBID: { type: 'number' },
      },
      required: ['accountDBID', 'clanDBID'],
      additionalProperties: false,
    },
    overview: {
      type: 'object',
      properties: {
        vehicle: { type: 'string' },
        xp: { type: 'number' }, // TODO: keep unmodified maybe instead of this?
        xpPosition: { type: 'number' },
        freeXP: { type: 'number' },
        credits: { type: 'number' },
        totalDamaged: { type: 'number' },
      },
      required: ['xp', 'freeXP', 'credits'],
      additionalProperties: false,
    },
    details: {
      type: 'object',
      properties: {
        spottingDamage: { type: 'number', nullable: true },
        trackingDamage: { type: 'number', nullable: true },
        stunned: { type: 'number', nullable: true }, // TODO: check to see what perspective this is from
        stunDuration: { type: 'number', nullable: true }, // TODO: check to see what perspective this is from
        piggyBank: { type: 'number', nullable: true }, // TODO: is this maybe the extra credits when you have prem time?
        winAloneAgainstVehicleCount: { type: 'number', nullable: true },
        damagedWhileMoving: { type: 'number', nullable: true }, // TODO: damage done while enemy is moving, or damage taken while moving?
        kills: { type: 'number', nullable: true },
        percentFromTotalTeamDamage: { type: 'number', nullable: true },
        markOfMastery: { type: 'number', nullable: true }, // what... is this? In a good battle, I've seen values above 3...
        noDamageDirectHitsReceived: { type: 'number', nullable: true },
        originalTMenXP: { type: 'number', nullable: true }, // TODO: I think this might be unedited xp? Should check and replace above xp if so
        movingAvgDamage: { type: 'number', nullable: true }, // TODO: not sure what this is
        shots: { type: 'number', nullable: true }, // TODO: rename to shotsFired
        deathCount: { type: 'number', nullable: true }, // TODO: probably only really useful for frontline
        stunNum: { type: 'number', nullable: true }, // TODO: rename moar better
        spotted: { type: 'number', nullable: true }, // TODO: rename?
        killerID: { type: 'number', nullable: true }, // TODO: make sure we're pulling in killers dbid here
        damagedHp: { type: 'number', nullable: true }, // TODO: is this maybe self-inflicted damage?
        directEnemyHits: { type: 'number', nullable: true },
        damageReceived: { type: 'number', nullable: true },
        health: { type: 'number', nullable: true }, // TODO: rename to ending health or something
        mileage: { type: 'number', nullable: true }, // km? Check and name better
        achievements: { type: 'array', items: { type: 'number' }, nullable: true }, // TODO: figure out how to map these to the achievement names
        isFirstBlood: { type: 'boolean', nullable: true }, // TODO: figure out what this actually means and rename
        resourceAbsorbed: { type: 'number', nullable: true }, // maybe mirny? Make sure this one's optional
        committedSuicide: { type: 'boolean', nullable: true },
        potentialDamageReceived: { type: 'number', nullable: true },
        damageDealt: { type: 'number', nullable: true },
        marksOnGun: { type: 'number', nullable: true }, // TODO: well... this isn't actual on the gun... but maybe instantaneous mark?
        directHits: { type: 'number', nullable: true },
        repair: { type: 'number', nullable: true }, // TODO: rename to repairCost
        originalCredits: { type: 'number', nullable: true }, // TODO: justify this with overview stuff
        sniperDamageDealt: { type: 'number', nullable: true },
        damageBlockedByArmor: { type: 'number', nullable: true },
        damageReceivedFromInvisibles: { type: 'number', nullable: true },
        flagActions: { type: 'array', items: { type: 'number' }, nullable: true }, // TODO: figure out how to map these to the flag action names
        maxHealth: { type: 'number', nullable: true }, // TODO: figure out if this is a handy one to keep :shrugs:
        directTeamHits: { type: 'number', nullable: true }, // TODO: this is hitting teammates?
        piercings: { type: 'number', nullable: true }, // TODO: rename to penetrations or something
        killsBeforeTeamWasDamaged: { type: 'number', nullable: true }, // TODO: verify that this is what it sounds like
        lifeTime: { type: 'number', nullable: true }, // TODO: seconds? Make sure this lines up
        piercingsReceived: { type: 'number', nullable: true }, // TODO: rename to penetrationsReceived or something
        percentFromSecondBestDamage: { type: 'number', nullable: true }, // TODO: could have better naming
        piercingEnemyHits: { type: 'number', nullable: true }, // TODO: rename to penetrations
        deathReason: { type: 'number', nullable: true }, // TODO: figure out how to map these to the death reason names
        capturePoints: { type: 'number', nullable: true }, // TODO: lump into base action object maybe
        damageBeforeTeamWasDamaged: { type: 'number', nullable: true }, // TODO: investigate to see what this actually means
        explosionHitsReceived: { type: 'number', nullable: true }, // TODO: I think this might be from HE shells, but need to verify
        isTeamKiller: { type: 'boolean', nullable: true }, // TODO: figure out if this is useful (maybe only for clan stuff)
        prevMarkOfMastery: { type: 'number', nullable: true }, // TODO: figure out what this is
      },
      additionalProperties: false, // TODO: switch to false when removing additional properties
    },
    byEnemyVehicle: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          accountDBID: { type: 'number' },
          spotted: { type: 'number', nullable: true },
          crits: { type: 'number', nullable: true }, // erm... figure out what the number here actually means
          damageAssistedRadio: { type: 'number', nullable: true }, // TODO: rename these for consistency
          damageAssistedTrack: { type: 'number', nullable: true },
          damageAssistedStun: { type: 'number', nullable: true },
          fire: { type: 'number', nullable: true }, // TODO: rename maybe? Damage done by fire
          piercings: { type: 'number', nullable: true },
          directEnemyHits: { type: 'number', nullable: true },
          damageDealt: { type: 'number', nullable: true },
          piercingEnemyHits: { type: 'number', nullable: true }, // TODO: how does this differ from piercings?
          rickochetsReceived: { type: 'number', nullable: true }, // TODO: rename to ricochetsReceived. Also, good ole rick :P
          stunDuration: { type: 'number', nullable: true }, // TODO: figure out if this is useful
          damageReceived: { type: 'number', nullable: true }, // TODO: damage received from this player?
          explosionHits: { type: 'number', nullable: true }, // TODO: HE shell damage?
          damageBlockedByArmor: { type: 'number', nullable: true },
          noDamageDirectHitsReceived: { type: 'number', nullable: true },
          targetKills: { type: 'number', nullable: true }, // TODO: rename to kills?
          stunNum: { type: 'number', nullable: true }, // TODO: verify what this actually tracks
          directHits: { type: 'number', nullable: true },
        },
        required: ['accountDBID'],
        additionalProperties: false, // TODO: switch to false when removing additional properties
      },
    },
  },
  required: ['accountInfo', 'overview', 'details', 'byEnemyVehicle'],
  additionalProperties: true, // TODO: switch to false when removing additional properties
};

export function getPlayerResult(
  personal: any,
  vehicle: string,
  accountIdByAvatarId: Map<string, number>,
  filePath: string,
): IPlayerResult | null {
  if (!personal || typeof personal !== 'object') {
    logger.error({ filePath, typeFound: typeof personal }, 'Personal data is not an object');
    return null;
  }
  const personalKeys = Object.keys(personal);
  if (personalKeys.length !== 2) {
    logger.warn(
      { filePath, keys: personalKeys },
      'Found personal data with more than 2 keys - investigate for additional info',
    );
  }
  const dataKey = personalKeys.find((key) => Number.isInteger(Number(key)));
  if (!dataKey) {
    logger.error({ filePath, keys: personalKeys }, 'Personal data does not contain a number key');
    return null;
  }
  const { [dataKey]: personalResults = {}, avatar = {} } = personal;
  const { accountDBID, clanDBID, xp, freeXP, totalDamaged, fareTeamXPPosition: xpPosition, credits } = avatar;

  const byEnemyVehicle: IResultsByEnemyVehicle = [];
  Object.keys(personalResults.details).forEach((malformedId) => {
    const avatarID = malformedId.match(/\d+/)?.[0];
    const dbid = avatarID && accountIdByAvatarId.get(avatarID);
    if (dbid) {
      byEnemyVehicle.push({
        accountDBID: dbid,
        ...personalResults.details[malformedId],
      });
    }
  });

  const data: IPlayerResult = {
    accountInfo: {
      accountDBID,
      clanDBID,
    },
    overview: {
      vehicle,
      xp, // TODO: pull out original stuff here from personal results, not modified values
      xpPosition,
      freeXP,
      credits,
      totalDamaged,
    },
    details: {
      spottingDamage: personalResults.damageAssistedRadio,
      trackingDamage: personalResults.damageAssistedTrack, // TODO: categorize this better
      ...personalResults,
    },
    byEnemyVehicle,
  };
  if (!validateAndRemoveAdditionalProperties<IPlayerResult>(playerResultSchema, data, logger)) {
    return null;
  }
  return data;
}
