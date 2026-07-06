import { authDevBypassEnabled, googleConfigured, mailEnabled } from './auth.service';

/**
 * The mock-Google bypass mints real sessions, so it must NEVER be live when real
 * Google credentials are configured (that would be a login-as-anyone endpoint).
 * This guard is F7's equivalent of the certificate tamper test.
 */
describe('auth env gating', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('bypass is ON in the zero-key default (no Google creds)', () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.AUTH_DEV_BYPASS;
    expect(googleConfigured()).toBe(false);
    expect(authDevBypassEnabled()).toBe(true);
  });

  it('bypass is OFF when real Google credentials are present', () => {
    process.env.GOOGLE_CLIENT_ID = 'real-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'real-secret';
    delete process.env.AUTH_DEV_BYPASS;
    expect(googleConfigured()).toBe(true);
    expect(authDevBypassEnabled()).toBe(false);
  });

  it('bypass can be force-enabled even with creds via AUTH_DEV_BYPASS=true', () => {
    process.env.GOOGLE_CLIENT_ID = 'real-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'real-secret';
    process.env.AUTH_DEV_BYPASS = 'true';
    expect(authDevBypassEnabled()).toBe(true);
  });

  it('mail is disabled by default so dev registrations auto-verify', () => {
    delete process.env.MAIL_ENABLED;
    expect(mailEnabled()).toBe(false);
  });
});
