import { Transform } from 'stream';
import type { IGameMetadata, IPlayerInfo, IPreGameInfo, Primitive, IGameData, IPostGameInfo } from './types';
import { getSafe as getSafeBase } from './utils';
import { getLogger } from './Logger';

const logger = getLogger('ParseMetadata');
function getSafe<T>(obj: unknown, path: string, expectedType: Primitive): T | undefined {
  return getSafeBase<T>(obj, path, expectedType, logger);
}

const parsePreGame = (data: unknown, filePath: string): IPreGameInfo => {
  if (typeof data !== 'object') {
    throw new Error('Invalid preGame data');
  }

  const vehicles = getSafe<unknown>(data, 'vehicles', 'object');
  const teams: { [key: string]: IPlayerInfo[] } = {};
  if (!vehicles) {
    logger.warn({ filePath }, 'No vehicles found in preGame data');
  } else {
    Object.values(vehicles).forEach((vehicle) => {
      if (typeof vehicle !== 'object') {
        logger.warn({ filePath }, 'Invalid vehicle data');
        return;
      }
      const teamID: number = vehicle.team;
      const vehicleInfo = {
        playerName: vehicle.name,
        teamID,
        sessionID: vehicle.avatarSessionID,
        anonymizedName: vehicle.fakeName === vehicle.name ? undefined : vehicle.fakeName,
        clan: vehicle.clanAbbrev,
        vehicleType: vehicle.vehicleType,
        vehicleMaxHealth: vehicle.maxHealth,
        isTeamKiller: vehicle.isTeamKiller,
        botDisplayStatus: vehicle.botDisplayStatus,
      };
      const team = teams[teamID];
      if (team) {
        team.push(vehicleInfo);
      } else {
        teams[teamID] = [vehicleInfo];
      }
    });
  }

  const playerName = getSafe<string>(data, 'playerName', 'string');
  let allies: IPlayerInfo[] = [];
  let enemies: IPlayerInfo[] = [];
  const [team1, team2, wtf] = Object.values(teams);
  if (!team1 || !team2 || wtf) {
    logger.warn({ filePath, teamKeys: Object.keys(teams) }, 'Invalid number of teams');
  } else if (team1.some((player: IPlayerInfo) => player.playerName === playerName)) {
    allies = team1;
    enemies = team2;
  } else if (team2.some((player: IPlayerInfo) => player.playerName === playerName)) {
    allies = team2;
    enemies = team1;
  } else {
    logger.warn(
      {
        filePath,
        playerName,
        playersByTeam: {
          team1: team1.map((player) => player.playerName),
          team2: team2.map((player) => player.playerName),
        },
      },
      'Player name not found in teams',
    );
  }

  return {
    playerName,
    serverName: getSafe<string>(data, 'serverName', 'string'),
    regionCode: getSafe<string>(data, 'regionCode', 'string'),
    clientVersion: getSafe<string>(data, 'clientVersionFromExe', 'string'),
    mapDisplayName: getSafe<string>(data, 'mapDisplayName', 'string'),
    mapName: getSafe<string>(data, 'mapName', 'string'),
    time: getSafe<string>(data, 'dateTime', 'string'),
    gameplayID: getSafe<string>(data, 'gameplayID', 'string'),
    battleType: getSafe<number>(data, 'battleType', 'number'),
    vehicles: { allies, enemies },
  };
};

const parsePostGame = (data: unknown) => {
  return data as IPostGameInfo;
};

export class ParseMetadata extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  override _transform(
    { preGame, postGame, filePath }: IGameMetadata,
    _encoding: BufferEncoding,
    callback: (error: Error | null, data?: IGameData) => void,
  ) {
    try {
      callback(null, {
        preGame: parsePreGame(preGame, filePath),
        postGame: parsePostGame(postGame),
      });
    } catch (error) {
      if (error instanceof Error) {
        callback(error);
      }
    }
  }
}
