import Ajv from 'ajv';
import type { Logger } from 'pino';

const ajv = new Ajv();
export function isValid<T>(schema: object, data: unknown, logger: Logger): data is T {
  const validate = ajv.compile(schema);
  const result = validate(data);
  if (validate.errors) {
    logger.error({ errors: validate.errors, data }, 'Data did not pass schema validation');
  }
  return result;
}

const ajvRemoveAdditional = new Ajv({ removeAdditional: true });
export function validateAndRemoveAdditionalProperties<T>(schema: object, data: unknown, logger: Logger): data is T {
  const validate = ajvRemoveAdditional.compile(schema);
  const result = validate(data);
  if (validate.errors) {
    logger.error({ errors: validate.errors, data }, 'Data did not pass schema validation');
  }
  return result;
}