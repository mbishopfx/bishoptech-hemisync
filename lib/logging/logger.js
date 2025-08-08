import pino from 'pino';

let singletonLogger;

export function getLogger() {
  if (!singletonLogger) {
    singletonLogger = pino({
      level: process.env.LOG_LEVEL || 'info',
      base: undefined
    });
  }
  return singletonLogger;
}


