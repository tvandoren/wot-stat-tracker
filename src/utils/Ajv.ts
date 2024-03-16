import Ajv, { type JSONSchemaType } from 'ajv';
import type { Logger } from 'pino';

const ajv = new Ajv();
const ajvRemoveAdditional = new Ajv({ removeAdditional: true });

export function validate<T>(
  schema: JSONSchemaType<T>,
  data: unknown,
  logger: Logger,
  removeAdditional = false,
): data is T {
  const ajvInstance = removeAdditional ? ajvRemoveAdditional : ajv;
  const validate = ajvInstance.compile(schema);
  const result = validate(data);
  if (validate.errors) {
    logger.error({ errors: validate.errors, data }, 'Data did not pass schema validation');
  }
  return result;
}