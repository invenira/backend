import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('OAUTH_KEY') || '',
    });
  }

  validate(payload: {
    preferred_username: string;
    realm_access: { roles: string[] };
  }): {
    user: string;
    roles: string[];
  } {
    if (
      !('azp' in payload) ||
      !('preferred_username' in payload) ||
      !('realm_access' in payload) ||
      !('roles' in payload.realm_access) ||
      !(
        Object.prototype.toString.call(payload?.realm_access?.roles) ===
        '[object Array]'
      )
    ) {
      throw new UnauthorizedException('Invalid JWT');
    }

    return {
      user: payload.preferred_username,
      roles: payload.realm_access.roles,
    };
  }
}
