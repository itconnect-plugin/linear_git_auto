import pino from 'pino';

export function createLogger() {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['apiKey', 'LINEAR_API_KEY', 'token', 'password', 'secret'],
      remove: true,
    },
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  });
}

export const logger = createLogger();
