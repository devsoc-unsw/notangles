import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';
import { userOnboard } from './userOnboard.util';

// TODO: Track usage of guest accounts, delete inactive ones
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validate(req: Request) {
    const user = await userOnboard({
      prisma: this.prisma,
      firstName: 'Guest',
      lastName: `User-${Date.now()}`,
      isGuest: true,
    });

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
