import type { IPostGameInfo, IPostGameMetadata } from '../types';
import { getLogger } from '../utils/Logger';

const logger = getLogger('PostGame');

export function getPostGameData(postGame: IPostGameMetadata, filePath: string): IPostGameInfo | null {
  logger.debug({ filePath, hasPostGame: Boolean(postGame) }, 'logging to make typscript stfu');
  return {};
}
