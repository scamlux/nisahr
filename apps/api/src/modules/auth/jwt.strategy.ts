import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../../common/decorators/current-user.decorator';
import { jwtAccessSecret } from '../../config/secrets';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret(),
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
