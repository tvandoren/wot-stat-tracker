export type Primitive = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';

export const expectedGeneralInfoKeys = [
  'personal',
  'players',
  'vehicles',
  'common',
  'arenaUniqueID',
  'avatars',
] as const;
export type GeneralInfoKey = (typeof expectedGeneralInfoKeys)[number];
export type IGeneralInfo = {
  [K in GeneralInfoKey]: K extends 'arenaUniqueID' ? number : Record<string, Record<string, unknown>>;
};
export type IPostGameMetadata = [IGeneralInfo, ...unknown[]];

// metadata directly extracted from replay
export interface IGameMetadata {
  filePath: string;
  preGame: {
    playerVehicle: string;
    [key: string]: unknown;
  };
  postGame?: IPostGameMetadata;
}

// metadata after cleaning
export interface IGameData {
  playerResults?: unknown;
  gameResults?: IPreGameInfo & IPostGameInfo;
}

export interface IPlayerResult {
  accountInfo: {
    accountDBID: number;
    clanDBID: number;
  };
  overview: {
    vehicle: string;
    xp: number;
    xpPosition: number;
    freeXP: number;
    credits: number;
    totalDamaged: number;
  };
  details: {
    spottingDamage?: number;
    trackingDamage?: number;
    stunned?: number;
    stunDuration?: number;
    piggyBank?: number;
    winAloneAgainstVehicleCount?: number;
    damagedWhileMoving?: number;
    kills?: number;
    percentFromTotalTeamDamage?: number;
    markOfMastery?: number;
    noDamageDirectHitsReceived?: number;
    originalTMenXP?: number;
    movingAvgDamage?: number;
    shots?: number;
    deathCount?: number;
    stunNum?: number;
    spotted?: number;
    killerID?: number;
    damagedHp?: number;
    directEnemyHits?: number;
    damageReceived?: number;
    health?: number;
    mileage?: number;
    achievements?: number[]; // Assuming this is correct based on items type
    isFirstBlood?: boolean;
    resourceAbsorbed?: number;
    committedSuicide?: boolean;
    potentialDamageReceived?: number;
    damageDealt?: number;
    marksOnGun?: number;
    directHits?: number;
    repair?: number;
    originalCredits?: number;
    sniperDamageDealt?: number;
    damageBlockedByArmor?: number;
    damageReceivedFromInvisibles?: number;
    flagActions?: number[]; // Assuming this is correct based on items type
    maxHealth?: number;
    directTeamHits?: number;
    piercings?: number;
    killsBeforeTeamWasDamaged?: number;
    lifeTime?: number;
    piercingsReceived?: number;
    percentFromSecondBestDamage?: number;
    piercingEnemyHits?: number;
    deathReason?: number;
    capturePoints?: number;
    damageBeforeTeamWasDamaged?: number;
    explosionHitsReceived?: number;
    isTeamKiller?: boolean;
    prevMarkOfMastery?: number;
  };
  byEnemyVehicle: IResultsByEnemyVehicle;
}

export type IResultsByEnemyVehicle = Array<{
  accountDBID: number;
  spotted?: number;
  crits?: number; // TODO: figure out what the number here actually means
  damageAssistedRadio?: number; // TODO: rename these for consistency
  damageAssistedTrack?: number;
  damageAssistedStun?: number;
  fire?: number; // TODO: rename maybe? Damage done by fire
  piercings?: number;
  directEnemyHits?: number;
  damageDealt?: number;
  piercingEnemyHits?: number; // TODO: how does this differ from piercings?
  rickochetsReceived?: number; // TODO: correct typo here
  stunDuration?: number; // TODO: figure out if this is useful
  damageReceived?: number; // TODO: damage received from this player?
  explosionHits?: number; // TODO: HE shell damage?
  damageBlockedByArmor?: number;
  noDamageDirectHitsReceived?: number;
  targetKills?: number; // TODO: rename to kills?
  stunNum?: number; // TODO: verify what this actually tracks
  directHits?: number;
}>;

export interface IPreGameInfo {
  serverName: string;
  regionCode: string;
  clientVersions: {
    fromExe?: string;
    fromXml?: string;
  };
  mapName: string;
  gameplayID: string;
  battleType: number; // not sure what this one is yet, but seems potentially useful to keep
}

export interface IPlayerInfo {
  listedName: string | undefined;
  teamID: number | undefined;
  vehicleSessionID: string | undefined;
  clan: string | undefined;
  vehicleType: string | undefined;
  vehicleMaxHealth: number | undefined;
  isTeamKiller: boolean | undefined;
  botDisplayStatus: string | undefined;
}

export interface IPersonalResult {
  xp: number | undefined;
  isPrematureLeave: boolean | undefined;
  [key: string]: unknown;
}

export interface IPostGameInfo {
  [key: string]: unknown;
}
