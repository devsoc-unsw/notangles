import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { promisify } from 'util';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      name: { givenName: string; familyName: string };
      emails: { value: string; verified: boolean }[];
    },
  ) {
    const user = await this.authService.createUser({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      isGuest: false,
      provider: 'GOOGLE',
      subject: profile.id,
    });

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
