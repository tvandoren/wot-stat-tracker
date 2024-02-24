import type { Logger } from 'pino';
import type { Primitive } from './types';

export function getSafe<T>(obj: unknown, path: string, expectedType: Primitive, logger?: Logger): T | undefined {
  const pathParts = path.split('.');
  let current = obj;
  for (const part of pathParts) {
    if (current === null || current === undefined) {
      logger?.debug({ path, current }, 'Failed on path segement - null or undefined');
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part as keyof typeof current];
    } else {
      logger?.debug({ path, current }, 'Failed on path segement - property does not exist');
      return undefined;
    }
  }
  if (typeof current !== expectedType) {
    logger?.debug(
      { path, current, expectedType, actualType: typeof current },
      'Failed on path segement - actual type does not match expected',
    );
    return undefined;
  }
  return current as T;
}

export function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}