import type { Logger } from 'pino';
import type { JSONSchemaType } from 'ajv';
import { validateAndRemoveAdditionalProperties } from '../utils/Ajv';
import type { IIndividualResult, IUploaderExtras } from '../types';

// TODO - maybe interesting?
// capturingBase
// damagedEventList - maybe got damaged by random event?
// entityCaptured
// inBattleAchievements
// index ??
// numDefended
// numRecovered
// rolloutsCount
// soloFlagCapture
// tdamageDealt
// tdestroyedModules
// tkills

interface IUnstructuredResult {
  achievements?: number[]; // Assuming this is correct based on items type
  capturePoints?: number;
  credits: number;
  damageAssistedInspire?: number;
  damageAssistedRadio: number;
  damageAssistedStun: number;
  damageAssistedTrack: number;
  damageBlockedByArmor: number;
  damaged: number;
  damageDealt: number;
  damagedHp: number;
  damageReceived: number;
  damageReceivedFromInvisibles: number;
  deathCount?: number;
  deathReason?: number;
  directEnemyHits?: number;
  directHits: number;
  directHitsReceived?: number;
  directTeamHits?: number;
  droppedCapturePoints?: number; // TODO: figure out what this is
  explosionHits: number;
  explosionHitsReceived?: number;
  flagActions?: number[]; // Assuming this is correct based on items type
  flagCapture?: number; // TODO: figure out what this is
  health?: number;
  isFirstBlood?: boolean;
  isTeamKiller?: boolean;
  killerID?: number;
  kills?: number;
  lifeTime?: number;
  marksOnGun?: number;
  maxHealth?: number;
  mileage?: number;
  noDamageDirectHitsReceived?: number;
  piercingEnemyHits?: number;
  piercings?: number;
  piercingsReceived?: number;
  potentialDamageReceived?: number;
  resourceAbsorbed?: number;
  sessionID: string;
  shots?: number;
  sniperDamageDealt?: number;
  spotted?: number;
  stunDuration?: number;
  stunned?: number;
  stunNum?: number;
  team: number;
  xp: number;
  // below this seem to only be found in personal results
  committedSuicide?: boolean;
  damageBeforeTeamWasDamaged?: number;
  damagedWhileEnemyMoving?: number;
  damagedWhileMoving?: number;
  killsBeforeTeamWasDamaged?: number;
  markOfMastery?: number;
  movingAvgDamage?: number;
  percentFromSecondBestDamage?: number;
  percentFromTotalTeamDamage?: number;
  prevMarkOfMastery?: number;
  repair?: number;
  winAloneAgainstVehicleCount?: number;
}

const playerResultSchema: JSONSchemaType<IUnstructuredResult> = {
  type: 'object',
  properties: {
    achievements: { type: 'array', items: { type: 'number' }, nullable: true }, // TODO: figure out how to map these to the achievement names
    capturePoints: { type: 'number', nullable: true }, // TODO: lump into base action object maybe
    credits: { type: 'number' },
    damageAssistedInspire: { type: 'number', nullable: true },
    damageAssistedRadio: { type: 'number' },
    damageAssistedStun: { type: 'number' },
    damageAssistedTrack: { type: 'number' },
    damageBlockedByArmor: { type: 'number' },
    damaged: { type: 'number' },
    damageDealt: { type: 'number' },
    damagedHp: { type: 'number' }, // TODO: is this maybe self-inflicted damage?
    damageReceived: { type: 'number' },
    damageReceivedFromInvisibles: { type: 'number' },
    deathCount: { type: 'number', nullable: true }, // TODO: probably only really useful for frontline
    deathReason: { type: 'number', nullable: true }, // TODO: figure out how to map these to the death reason names
    directEnemyHits: { type: 'number', nullable: true },
    directHits: { type: 'number' },
    directHitsReceived: { type: 'number', nullable: true }, // TODO: figure out if this is hits received or hits on enemies
    directTeamHits: { type: 'number', nullable: true }, // TODO: this is hitting teammates?
    droppedCapturePoints: { type: 'number', nullable: true }, // TODO: figure out what this is
    explosionHits: { type: 'number' },
    explosionHitsReceived: { type: 'number', nullable: true }, // TODO: I think this might be from HE shells, but need to verify
    flagActions: { type: 'array', items: { type: 'number' }, nullable: true }, // TODO: figure out how to map these to the flag action names
    flagCapture: { type: 'number', nullable: true }, // TODO: figure out what this is
    health: { type: 'number', nullable: true }, // TODO: rename to ending health or something
    isAlive: { type: 'boolean' },
    isFirstBlood: { type: 'boolean', nullable: true }, // TODO: figure out what this actually means and rename
    isTeamKiller: { type: 'boolean', nullable: true }, // TODO: figure out if this is useful (maybe only for clan stuff)
    killerID: { type: 'number', nullable: true }, // TODO: make sure we're pulling in killers dbid here
    kills: { type: 'number', nullable: true },
    lifeTime: { type: 'number', nullable: true }, // TODO: seconds? Make sure this lines up
    marksOnGun: { type: 'number', nullable: true }, // TODO: well... this isn't actual on the gun... but maybe instantaneous mark?
    maxHealth: { type: 'number', nullable: true }, // TODO: figure out if this is a handy one to keep :shrugs:
    mileage: { type: 'number', nullable: true }, // km? Check and name better
    noDamageDirectHitsReceived: { type: 'number', nullable: true },
    piercingEnemyHits: { type: 'number', nullable: true }, // TODO: rename to penetrations
    piercings: { type: 'number', nullable: true }, // TODO: rename to penetrations or something
    piercingsReceived: { type: 'number', nullable: true }, // TODO: rename to penetrationsReceived or something
    potentialDamageReceived: { type: 'number', nullable: true },
    resourceAbsorbed: { type: 'number', nullable: true }, // maybe mirny? Make sure this one's optional
    sessionID: { type: 'string' },
    shots: { type: 'number', nullable: true }, // TODO: rename to shotsFired
    sniperDamageDealt: { type: 'number', nullable: true },
    spotted: { type: 'number', nullable: true }, // TODO: rename?
    stunDuration: { type: 'number', nullable: true }, // TODO: check to see what perspective this is from
    stunned: { type: 'number', nullable: true }, // TODO: check to see what perspective this is from
    stunNum: { type: 'number', nullable: true }, // TODO: rename moar better
    team: { type: 'number' },
    xp: { type: 'number' }, // TODO: rename to xpEarned
    // below this seem to only be found in personal results
    committedSuicide: { type: 'boolean', nullable: true },
    damageBeforeTeamWasDamaged: { type: 'number', nullable: true }, // TODO: investigate to see what this actually means
    damagedWhileEnemyMoving: { type: 'number', nullable: true }, // TODO: damage done while enemy is moving, or damage taken while moving?
    damagedWhileMoving: { type: 'number', nullable: true }, // TODO: damage done while enemy is moving, or damage taken while moving?
    killsBeforeTeamWasDamaged: { type: 'number', nullable: true }, // TODO: verify that this is what it sounds like
    markOfMastery: { type: 'number', nullable: true }, // what... is this? In a good battle, I've seen values above 3...
    movingAvgDamage: { type: 'number', nullable: true }, // TODO: not sure what this is
    percentFromSecondBestDamage: { type: 'number', nullable: true }, // TODO: could have better naming
    percentFromTotalTeamDamage: { type: 'number', nullable: true },
    prevMarkOfMastery: { type: 'number', nullable: true }, // TODO: figure out what this is
    repair: { type: 'number', nullable: true }, // TODO: rename to repairCost
    winAloneAgainstVehicleCount: { type: 'number', nullable: true }, // only for personal result, I think
  },
  required: ['sessionID', 'team'],
  additionalProperties: false, // TODO: switch to false when removing additional properties
};

function convertToStructuredResult(
  unstructured: IUnstructuredResult,
  includePlayerResult = false,
): IIndividualResult | (IIndividualResult & IUploaderExtras) {
  return {
    economic: {
      credits: unstructured.credits,
      xp: unstructured.xp,
    },
    combat: {
      damaged: unstructured.damaged,
      damageDealt: unstructured.damageDealt,
      kills: unstructured.kills,
      directHits: unstructured.directHits,
      directEnemyHits: unstructured.directEnemyHits,
      directTeamHits: unstructured.directTeamHits,
      explosionHits: unstructured.explosionHits,
      isTeamKiller: unstructured.isTeamKiller,
      killerID: unstructured.killerID,
      piercingEnemyHits: unstructured.piercingEnemyHits,
      piercings: unstructured.piercings,
      shots: unstructured.shots,
      sniperDamageDealt: unstructured.sniperDamageDealt,
      stunDuration: unstructured.stunDuration,
      stunned: unstructured.stunned,
      stunNum: unstructured.stunNum,
    },
    assistance: {
      damageAssistedRadio: unstructured.damageAssistedRadio,
      damageAssistedStun: unstructured.damageAssistedStun,
      damageAssistedTrack: unstructured.damageAssistedTrack,
      damageAssistedInspire: unstructured.damageAssistedInspire,
      spotted: unstructured.spotted,
    },
    survivability: {
      damageBlockedByArmor: unstructured.damageBlockedByArmor,
      damageReceived: unstructured.damageReceived,
      damageReceivedFromInvisibles: unstructured.damageReceivedFromInvisibles,
      deathCount: unstructured.deathCount,
      deathReason: unstructured.deathReason,
      directHitsReceived: unstructured.directHitsReceived,
      explosionHitsReceived: unstructured.explosionHitsReceived,
      health: unstructured.health,
      isFirstBlood: unstructured.isFirstBlood,
      lifeTime: unstructured.lifeTime,
      maxHealth: unstructured.maxHealth,
      noDamageDirectHitsReceived: unstructured.noDamageDirectHitsReceived,
      piercingsReceived: unstructured.piercingsReceived,
      potentialDamageReceived: unstructured.potentialDamageReceived,
    },
    misc: {
      achievements: unstructured.achievements,
      capturePoints: unstructured.capturePoints,
      droppedCapturePoints: unstructured.droppedCapturePoints,
      flagActions: unstructured.flagActions,
      flagCapture: unstructured.flagCapture,
      marksOnGun: unstructured.marksOnGun,
      mileage: unstructured.mileage,
      resourceAbsorbed: unstructured.resourceAbsorbed,
      sessionID: unstructured.sessionID,
      team: unstructured.team,
    },
    ...(includePlayerResult && {
      personal: {
        committedSuicide: unstructured.committedSuicide,
        damageBeforeTeamWasDamaged: unstructured.damageBeforeTeamWasDamaged,
        damagedWhileEnemyMoving: unstructured.damagedWhileEnemyMoving,
        damagedWhileMoving: unstructured.damagedWhileMoving,
        killsBeforeTeamWasDamaged: unstructured.killsBeforeTeamWasDamaged,
        markOfMastery: unstructured.markOfMastery,
        movingAvgDamage: unstructured.movingAvgDamage,
        percentFromSecondBestDamage: unstructured.percentFromSecondBestDamage,
        percentFromTotalTeamDamage: unstructured.percentFromTotalTeamDamage,
        prevMarkOfMastery: unstructured.prevMarkOfMastery,
        repair: unstructured.repair,
        winAloneAgainstVehicleCount: unstructured.winAloneAgainstVehicleCount,
      },
    }),
  };
}

export const getIndividualResult = (data: unknown, logger: Logger): IIndividualResult | undefined => {
  // don't break original data
  const unstructured = structuredClone(data);
  if (validateAndRemoveAdditionalProperties<IUnstructuredResult>(playerResultSchema, unstructured, logger)) {
    return convertToStructuredResult(unstructured) as IIndividualResult;
  }
  return undefined;
};

export const getUploaderResult = (data: unknown, logger: Logger): (IIndividualResult & IUploaderExtras) | undefined => {
  // don't break original data
  const unstructured = structuredClone(data);
  if (validateAndRemoveAdditionalProperties<IUnstructuredResult>(playerResultSchema, unstructured, logger)) {
    return convertToStructuredResult(unstructured, true) as IIndividualResult & IUploaderExtras;
  }
  return undefined;
};
