import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserinfoResponse } from 'openid-client';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(user: UserinfoResponse) {
    return user;
  }
}
