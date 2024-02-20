import pino from 'pino';

export const getLogger = (options?: pino.LoggerOptions) => pino(options);
