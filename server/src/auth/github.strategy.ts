import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-github2';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly prisma: PrismaService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      passReqToCallback: true,
      scope: ['user:email'],
    });
  }

  async validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: { id: number; name: string; email: string },
  ) {
    const user = await this.prisma.user.upsert({
      where: {
        authProvider_authSubject: {
          authProvider: 'GITHUB',
          authSubject: profile.id.toString(),
        },
      },
      update: {
        lastLogin: new Date(),
      },
      create: {
        authProvider: 'GITHUB',
        authSubject: profile.id.toString(),
        firstName: profile.name?.split(' ')[0] || 'GitHub',
        lastName: profile.name?.split(' ').slice(1).join(' ') || 'User',
        isGuest: false,
      },
    });

    if (user.createdAt.getTime() === user.lastLogin.getTime()) {
      await this.prisma.settings.create({
        data: {
          userId: user.id,
        },
      });
    }

    const login = promisify(req.login.bind(this));
    await login(user);
    return user;
  }
}
