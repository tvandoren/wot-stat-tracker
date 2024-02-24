import pino from 'pino';

const logLevel = process.env['LOG_LEVEL'] || 'info';

export const getLogger = (name: string) => pino({ name, level: logLevel });
