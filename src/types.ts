export type Primitive = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';

// metadata directly extracted from replay
export interface IGameMetadata {
  preGame: unknown;
  postGame?: unknown;
}

export interface IPreGameInfo {
  player: {
    vehicle?: string;
    name?: string;
    id?: number;
    clientVersion?: string;
  };
  server: {
    name?: string;
  };
  [key: string]: unknown;
}

export interface IPostGameInfo {
  [key: string]: unknown;
}

// metadata after cleaning
export interface IGameData {
  preGame: IPreGameInfo;
  postGame?: IPostGameInfo;
}
