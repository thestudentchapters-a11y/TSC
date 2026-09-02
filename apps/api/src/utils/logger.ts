/* Minimal structured logger (swap for pino/winston in production if desired). */
type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: string, meta?: unknown) {
  const line = `[tsc-api] ${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  // eslint-disable-next-line no-console
  level === 'error' ? console.error(line, meta ?? '') : level === 'warn' ? console.warn(line, meta ?? '') : console.log(line, meta ?? '');
}

export const logger = {
  info: (m: string, meta?: unknown) => log('info', m, meta),
  warn: (m: string, meta?: unknown) => log('warn', m, meta),
  error: (m: string, meta?: unknown) => log('error', m, meta),
};
