import { Logger } from '@nestjs/common';

const logger = new Logger('Config');

export const isProduction = (): boolean =>
  (process.env.NODE_ENV ?? 'development').toLowerCase() === 'production';

/**
 * Resolve a required secret.
 *
 * In production a missing, blank, or placeholder (`*change_me*`) value throws so
 * the process fails fast at boot instead of silently signing tokens with a
 * guessable key. In development it falls back to a clearly-marked insecure
 * default so local/zero-key runs keep working.
 */
export function requiredSecret(name: string, devFallback: string): string {
  const value = process.env[name]?.trim();
  if (value && !value.includes('change_me')) return value;
  if (isProduction()) {
    throw new Error(
      `[config] ${name} is not set. Refusing to start in production with an insecure default. ` +
        `Configure ${name} in the deployment environment.`,
    );
  }
  logger.warn(`${name} is unset — using an INSECURE development fallback. Never use this in production.`);
  return devFallback;
}

export const jwtAccessSecret = (): string =>
  requiredSecret('JWT_ACCESS_SECRET', 'dev_access_secret_change_me');

export const jwtRefreshSecret = (): string =>
  requiredSecret('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me');

/** Verification tokens reuse a dedicated secret, falling back to the access secret. */
export const emailVerifySecret = (): string =>
  process.env.EMAIL_VERIFY_SECRET?.trim() || jwtAccessSecret();

/**
 * Validate that the environment is coherent for a production deployment.
 * Called once at bootstrap; throws on the first fatal misconfiguration.
 */
export function assertProductionConfig(): void {
  if (!isProduction()) return;
  const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter((k) => !process.env[k]?.trim() || process.env[k]!.includes('change_me'));
  if (missing.length) {
    throw new Error(`[config] Missing required production env vars: ${missing.join(', ')}`);
  }
  if (!process.env.CORS_ORIGIN?.trim()) {
    logger.warn('CORS_ORIGIN is not set — falling back to http://localhost:3000, which will block your production web origin.');
  }
}
