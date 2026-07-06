import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  googleMockSchema,
  googleCallbackSchema,
  verifyEmailSchema,
  LoginDto,
  RegisterDto,
  RefreshDto,
  GoogleMockDto,
  GoogleCallbackDto,
  VerifyEmailDto,
} from '@careeros/shared';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @UsePipes(new ZodValidationPipe(refreshSchema))
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.auth.me(user.userId);
  }

  /* ----------------------------- F7: OAuth ------------------------------- */

  @Get('google/config')
  @ApiOperation({ summary: 'Google sign-in availability + auth URL (or dev bypass)' })
  googleConfig() {
    return this.auth.googleConfig();
  }

  @Post('google/mock')
  @ApiOperation({ summary: 'Zero-key "Sign in with Google" (dev/demo bypass)' })
  @UsePipes(new ZodValidationPipe(googleMockSchema))
  googleMock(@Body() dto: GoogleMockDto) {
    return this.auth.googleMock(dto);
  }

  @Post('google/callback')
  @ApiOperation({ summary: 'Real Google OAuth2 code exchange (needs credentials)' })
  @UsePipes(new ZodValidationPipe(googleCallbackSchema))
  googleCallback(@Body() dto: GoogleCallbackDto) {
    return this.auth.googleCallback(dto.code, dto.redirectUri);
  }

  /* ----------------------- F7: email verification ------------------------ */

  @Post('request-verification')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request an email-verification token (returned in dev)' })
  requestVerification(@CurrentUser() user: JwtUser) {
    return this.auth.requestVerification(user.userId);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Confirm an email-verification token' })
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }
}
