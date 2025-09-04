import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private readonly prisma: PrismaService) {
    // TODO: How to fix this lint?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  async validate(req: Request) {
    const user = await this.prisma.user.create({
      data: {
        firstName: 'Guest',
        lastName: 'User',
        isGuest: true,
      },
    });

    await this.prisma.settings.create({
      data: {
        userId: user.id,
      },
    });

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
