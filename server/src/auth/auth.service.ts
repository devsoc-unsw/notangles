import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthProvider, Prisma, User } from 'src/generated/prisma/client';
import { Term } from 'src/timetable/types';
import { GraphqlService } from 'src/graphql/graphql.service';

interface OnboardParams {
  firstName: string;
  lastName: string;
  isGuest: boolean;
  provider?: AuthProvider;
  subject?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphql: GraphqlService,
  ) {}

  private readonly TIMETABLE_DEFAULT_NAME = 'My Timetable';

  async createUser(params: OnboardParams): Promise<User> {
    if (!params.isGuest) {
      return await this.createAuthUser(params);
    } else {
      return await this.createGuest(params);
    }
  }

  private async createAuthUser(params: OnboardParams): Promise<User> {
    const { provider, subject } = params;

    if (provider === undefined || subject === undefined) {
      throw new Error('Provider and subject must be defined for auth users');
    }
    const currentYear = new Date().getFullYear().toString();
    const { availableTerms } =
      await this.graphql.getAvailableTermsFrom(currentYear);
    if (availableTerms.length === 0) {
      throw new Error('No available terms found');
    }

    return await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.upsert({
        where: {
          authProvider_authSubject: {
            authProvider: provider,
            authSubject: subject,
          },
        },
        update: {
          lastLogin: new Date(),
        },
        create: {
          authProvider: provider,
          authSubject: subject,
          firstName: params.firstName,
          lastName: params.lastName,
          isGuest: params.isGuest,
          settings: { create: {} },
        },
      });

      await this.createDefaultTimetablesIfNotExist(
        transaction,
        user.id,
        availableTerms,
        this.TIMETABLE_DEFAULT_NAME,
      );

      return user;
    });
  }

  private async createGuest(params: OnboardParams): Promise<User> {
    const currentYear = new Date().getFullYear().toString();
    const { availableTerms } =
      await this.graphql.getAvailableTermsFrom(currentYear);
    if (availableTerms.length === 0) {
      throw new Error('No available terms found');
    }

    return await this.prisma.user.create({
      data: {
        firstName: params.firstName,
        lastName: params.lastName,
        isGuest: params.isGuest,
        settings: { create: {} },
        timetables: {
          create: availableTerms.map((availableTerm) => {
            const term = availableTerm.split('-')[0] as Term;
            const year = parseInt(availableTerm.split('-')[1]);
            return {
              name: this.TIMETABLE_DEFAULT_NAME,
              year,
              term,
            };
          }),
        },
      },
    });
  }

  private async createDefaultTimetablesIfNotExist(
    transaction: Prisma.TransactionClient,
    userId: string,
    availableTerms: string[],
    timetableName: string,
  ) {
    for (const availableTerm of availableTerms) {
      const term = availableTerm.split('-')[0] as Term;
      const year = parseInt(availableTerm.split('-')[1]);
      const existing =
        (await transaction.timetable.count({
          where: {
            userId: userId,
            year: year,
            term: term,
          },
        })) > 0;

      if (!existing) {
        await transaction.timetable.create({
          data: {
            userId: userId,
            name: timetableName,
            year: year,
            term,
          },
        });
      }
    }
  }
}
