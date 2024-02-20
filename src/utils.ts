import { Primitive } from './types';

export function getSafe<T>(obj: unknown, path: string, expectedType: Primitive): T | undefined {
  const pathParts = path.split('.');
  let current: any = obj;
  for (const part of pathParts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  if (typeof current !== expectedType) {
    return undefined;
  }
  return current as T;
}
