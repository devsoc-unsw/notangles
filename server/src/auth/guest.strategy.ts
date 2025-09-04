import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { PrismaService } from 'src/prisma/prisma.service';
import { promisify } from 'util';
import { Term } from 'src/timetable/types';

// TODO: Track usage of guest accounts, delete inactive ones
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private readonly prisma: PrismaService) {
    // TODO: How to fix this lint?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  async validate(req: Request) {
    const user = await this.prisma.user.create({
      // TODO: Generate unique names for guest users (to help with debugging)
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

    const currentYear = new Date().getFullYear();
    for (const term of Object.values(Term)) {
      const existing = await this.prisma.timetable.findFirst({
        where: { userId: user.id, year: currentYear, term },
      });
      if (!existing) {
        await this.prisma.timetable.create({
          data: {
            userId: user.id,
            name: 'My Timetable',
            year: currentYear,
            term,
          },
        });
      }
    }

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
