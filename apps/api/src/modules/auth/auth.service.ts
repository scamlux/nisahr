import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResponse, GoogleMockDto, LoginDto, RegisterDto } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

/** Real email sending is on only when explicitly configured; dev auto-verifies. */
export function mailEnabled(): boolean {
  return (process.env.MAIL_ENABLED ?? 'false').toLowerCase() === 'true';
}
/** Whether real Google OAuth2 credentials are present. */
export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
/**
 * The zero-key "mock Google" login is allowed only when real Google isn't
 * configured, or an explicit dev bypass is set. This prevents a login-as-anyone
 * endpoint from ever being live in a real, credentialed deployment.
 */
export function authDevBypassEnabled(): boolean {
  return !googleConfigured() || (process.env.AUTH_DEV_BYPASS ?? 'false').toLowerCase() === 'true';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      provider: user.provider,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async signTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me',
      expiresIn: process.env.JWT_ACCESS_TTL ?? '900s',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
      expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        // Dev/zero-key: no mail service → verify immediately so login is never
        // blocked. With MAIL_ENABLED=true a verification email would be sent.
        emailVerified: !mailEnabled(),
        careerProfile: { create: {} },
        subscription: { create: {} },
      },
    });
    if (mailEnabled()) this.sendVerificationEmail(user).catch(() => undefined);
    const tokens = await this.signTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google sign-in');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.signTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    const tokens = await this.signTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { careerProfile: true, subscription: true },
    });
    if (!user) throw new UnauthorizedException();
    return {
      ...this.toPublicUser(user),
      onboardingCompleted: user.careerProfile?.onboardingCompleted ?? false,
    };
  }

  /* --------------------------- F7: Google OAuth ---------------------------- */

  /** Config for the client's "Sign in with Google" button. */
  googleConfig() {
    return {
      configured: googleConfigured(),
      devBypass: authDevBypassEnabled(),
      authUrl: googleConfigured() ? this.googleAuthUrl() : null,
    };
  }

  private googleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Zero-key "Sign in with Google". Mints a real session for a Google identity
   * WITHOUT contacting Google — the default path when no OAuth creds are set.
   * Guarded by {@link authDevBypassEnabled} so it can never be live alongside
   * real Google credentials (that would be a login-as-anyone bypass).
   */
  async googleMock(dto: GoogleMockDto): Promise<AuthResponse> {
    if (!authDevBypassEnabled()) {
      throw new ForbiddenException('Mock Google sign-in is disabled when real OAuth is configured');
    }
    const name = dto.name?.trim() || dto.email.split('@')[0];
    // Google verifies email, so linking an existing account by email is safe.
    return this.upsertOAuthUser({
      email: dto.email.toLowerCase(),
      name,
      avatarUrl: dto.avatarUrl,
      providerId: `mock-${dto.email.toLowerCase()}`,
    });
  }

  /**
   * Real Google OAuth2 authorization-code exchange. Gated on credentials; only
   * runs in a properly configured deployment (not exercised in the zero-key demo).
   */
  async googleCallback(code: string, redirectUri?: string): Promise<AuthResponse> {
    if (!googleConfigured()) throw new BadRequestException('Google OAuth is not configured');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: redirectUri ?? process.env.GOOGLE_REDIRECT_URI ?? '',
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException('Google token exchange failed');
    const { access_token } = (await tokenRes.json()) as { access_token: string };
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!profileRes.ok) throw new UnauthorizedException('Could not fetch Google profile');
    const p = (await profileRes.json()) as {
      sub: string; email: string; email_verified?: boolean; name?: string; picture?: string;
    };
    if (!p.email || p.email_verified === false) {
      throw new UnauthorizedException('Google account email is not verified');
    }
    return this.upsertOAuthUser({
      email: p.email.toLowerCase(),
      name: p.name ?? p.email.split('@')[0],
      avatarUrl: p.picture,
      providerId: p.sub,
    });
  }

  /** Link-by-verified-email or create; never touches an unverified account. */
  private async upsertOAuthUser(input: {
    email: string;
    name: string;
    avatarUrl?: string;
    providerId: string;
  }): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    let user: User;
    if (existing) {
      user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          emailVerified: true,
          avatarUrl: existing.avatarUrl ?? input.avatarUrl ?? null,
          // Adopt google as provider only for accounts that had no password.
          provider: existing.passwordHash ? existing.provider : 'google',
          providerId: existing.providerId ?? input.providerId,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash: null,
          provider: 'google',
          providerId: input.providerId,
          avatarUrl: input.avatarUrl ?? null,
          emailVerified: true,
          careerProfile: { create: {} },
          subscription: { create: {} },
        },
      });
    }
    const tokens = await this.signTokens(user);
    return { user: this.toPublicUser(user), tokens };
  }

  /* ----------------------- F7: email verification ------------------------- */

  private verifyEmailSecret(): string {
    return process.env.EMAIL_VERIFY_SECRET ?? process.env.JWT_SECRET ?? 'dev_verify_secret_change_me';
  }

  /** Signed, stateless verification token (would be emailed in production). */
  private async signVerifyToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, purpose: 'email-verify' },
      { secret: this.verifyEmailSecret(), expiresIn: '2d' },
    );
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const token = await this.signVerifyToken(user.id);
    // No mail provider is wired in this build; log the link so it is testable.
    this.logger.log(`Email verification link for ${user.email}: /verify-email?token=${token}`);
  }

  /**
   * Request a verification token. In dev / with the bypass on, the token is
   * returned directly (no mail service); in production it is emailed instead.
   */
  async requestVerification(userId: string): Promise<{ sent: boolean; token?: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.emailVerified) return { sent: false };
    const token = await this.signVerifyToken(user.id);
    if (mailEnabled()) {
      await this.sendVerificationEmail(user);
      return { sent: true };
    }
    return { sent: true, token };
  }

  async verifyEmail(token: string): Promise<{ verified: boolean }> {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(token, { secret: this.verifyEmailSecret() });
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (payload.purpose !== 'email-verify') throw new BadRequestException('Wrong token type');
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true },
    });
    return { verified: true };
  }
}
