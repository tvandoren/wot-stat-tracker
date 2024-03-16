const expectedGeneralInfoKeys = ['personal', 'players', 'vehicles', 'common', 'arenaUniqueID', 'avatars'] as const;
type GeneralInfoKey = (typeof expectedGeneralInfoKeys)[number];
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

export interface IIndividualResult {
  economic: {
    credits: number;
    xp: number;
  };
  combat: {
    damaged: number;
    damageDealt: number;
    kills?: number;
    directHits: number;
    directEnemyHits?: number;
    directTeamHits?: number;
    explosionHits: number;
    isTeamKiller?: boolean;
    killerID?: number;
    piercingEnemyHits?: number;
    piercings?: number;
    shots?: number;
    sniperDamageDealt?: number;
    stunDuration?: number;
    stunned?: number;
    stunNum?: number;
  };
  assistance: {
    damageAssistedRadio: number;
    damageAssistedStun: number;
    damageAssistedTrack: number;
    damageAssistedInspire?: number;
    spotted?: number;
  };
  survivability: {
    damageBlockedByArmor: number;
    damageReceived: number;
    damageReceivedFromInvisibles: number;
    deathCount?: number;
    deathReason?: number;
    directHitsReceived?: number;
    explosionHitsReceived?: number;
    health?: number;
    isFirstBlood?: boolean;
    lifeTime?: number;
    maxHealth?: number;
    noDamageDirectHitsReceived?: number;
    piercingsReceived?: number;
    potentialDamageReceived?: number;
  };
  misc: {
    achievements?: number[];
    capturePoints?: number;
    droppedCapturePoints?: number;
    flagActions?: number[];
    flagCapture?: number;
    marksOnGun?: number;
    mileage?: number;
    resourceAbsorbed?: number;
    sessionID: string;
    team: number;
  };
}

export interface IUploaderExtras {
  personal: {
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
  };
}

export interface IBasePlayerInfo {
  vehicleType: string;
  team: number;
  realName: string;
  fakeName: string;
  sessionID: string;
  clanDBID?: number;
}

export interface IPlayerInfo extends IBasePlayerInfo {
  battleResult?: IIndividualResult;
}

export interface IResultByEnemyVehicle {
  dbid: number;
  vehicleType: string;
  critsInflicted?: number;
  directHits?: number;
  explosionHits?: number;
  fireDamage?: number;
  gotKill: boolean;
  piercingHits?: number;
  stunCount?: number;
  totalDamageDealt?: number;
  totalStunDuration?: number;
  damageAssistedRadio?: number;
  damageAssistedStun?: number;
  damageAssistedTrack?: number;
  gotInitialSpot?: boolean;
  damageBlockedByArmor?: number;
  ricochetsReceived?: number;
  noDamageDirectHitsReceived?: number;
}

export interface IPreGameData {
  serverName: string;
  regionCode: string;
  clientVersions: {
    fromExe?: string;
    fromXml?: string;
  };
  mapName: string;
  mapDisplayName: string;
  gameplayID: string;
  battleTypeCode: number;
  battleType?: string;
  uploaderDBID: number;
}

export interface IUploaderInfo extends IBasePlayerInfo {
  battleResult: IIndividualResult & IUploaderExtras;
  byEnemyVehicle: IResultByEnemyVehicle[];
}

export interface IPersonalResultData extends IUploaderInfo, IPreGameData {}

// metadata after cleaning
export interface IGameData extends IPreGameData {
  arenaUniqueID: number;
  finishReason: number;
  arenaCreateTime: number;
  winningTeam: number;
  teamHealth: {
    [key: string]: number;
  };
  arenaTypeID: number;
  duration: number; // seconds?
  playerInfo: (IPlayerInfo & { dbid: string })[];
}
