export type Primitive = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';

// metadata directly extracted from replay
export interface IGameMetadata {
  filePath: string;
  preGame: unknown;
  postGame?: unknown;
}

export interface IPlayerInfo {
  listedName: string | undefined;
  teamID: number | undefined;
  sessionID: string | undefined;
  clan: string | undefined;
  vehicleType: string | undefined;
  vehicleMaxHealth: number | undefined;
  isTeamKiller: boolean | undefined;
  botDisplayStatus: string | undefined;
}

export interface IPreGameInfo {
  playerName: string | undefined;
  serverName: string | undefined;
  regionCode: string | undefined;
  clientVersion: string | undefined;
  mapDisplayName: string | undefined;
  mapName: string | undefined;
  time: string | undefined;
  gameplayID: string | undefined;
  battleType: number | undefined; // not sure what this one is yet, but seems potentially useful to keep
  vehicles: {
    allies: IPlayerInfo[];
    enemies: IPlayerInfo[];
  };
}

export interface IPostGameInfo {
  [key: string]: unknown;
}

// metadata after cleaning
export interface IGameData {
  preGame: IPreGameInfo;
  postGame?: IPostGameInfo;
}
