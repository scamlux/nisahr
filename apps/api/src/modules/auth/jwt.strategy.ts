import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    plan: string;
  }): Promise<JwtUser> {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      plan: payload.plan,
    };
  }
}
