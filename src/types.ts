interface IPreGameInfo {
  [key: string]: unknown;
}

interface IPostGameInfo {
  [key: string]: unknown;
}

export interface IGameData {
  preGame: IPreGameInfo;
  postGame?: IPostGameInfo;
}
