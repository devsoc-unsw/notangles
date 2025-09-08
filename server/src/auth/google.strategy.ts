import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-google-oauth20';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
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
    const user = await this.prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: 'GOOGLE',
          authSubject: profile.id,
        },
      },
      update: {
        lastLogin: new Date(),
      },
      create: {
        authProvider: 'GOOGLE',
        authSubject: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        isGuest: false,
        settings: {
          create: {},
        },
      },
    });

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
