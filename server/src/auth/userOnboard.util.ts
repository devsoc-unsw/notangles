import { AuthProvider, Prisma, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Term } from 'src/timetable/types';

interface OnboardParams {
  prisma: PrismaService;
  firstName: string;
  lastName: string;
  isGuest: boolean;
  timetableYear?: number;
  timetableName?: string;
  provider?: AuthProvider;
  subject?: string;
}

export async function userOnboard(params: OnboardParams): Promise<User> {
  if (!params.isGuest) {
    return await authUserOnboard({
      prisma: params.prisma,
      provider: params.provider,
      subject: params.subject,
      firstName: params.firstName,
      lastName: params.lastName,
      isGuest: params.isGuest,
      timetableYear: params.timetableYear,
      timetableName: params.timetableName,
    });
  } else {
    return await guestUserOnboard({
      prisma: params.prisma,
      firstName: params.firstName,
      lastName: params.lastName,
      isGuest: params.isGuest,
      timetableYear: params.timetableYear,
      timetableName: params.timetableName,
    });
  }
}

async function authUserOnboard(params: OnboardParams): Promise<User> {
  const { provider, subject } = params;

  if (provider === undefined || subject === undefined) {
    throw new Error('Provider and subject must be defined for auth users');
  }
  return await params.prisma.$transaction(async (transaction) => {
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
      },
    });

    await createSettingsIfNewUser(
      transaction,
      user.id,
      user.createdAt,
      user.lastLogin,
    );

    await createDefaultTimetablesIfNotExist(
      transaction,
      user.id,
      params.timetableYear ?? new Date().getFullYear(),
      params.timetableName ?? 'My Timetable',
      params.isGuest,
    );

    return user;
  });
}

async function guestUserOnboard(params: OnboardParams): Promise<User> {
  return await params.prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        firstName: params.firstName,
        lastName: params.lastName,
        isGuest: params.isGuest,
      },
    });

    await createSettingsIfNewUser(
      transaction,
      user.id,
      user.createdAt,
      user.lastLogin,
    );

    await createDefaultTimetablesIfNotExist(
      transaction,
      user.id,
      params.timetableYear ?? new Date().getFullYear(),
      params.timetableName ?? 'My Timetable',
      params.isGuest,
    );

    return user;
  });
}

async function createSettingsIfNewUser(
  transaction: Prisma.TransactionClient,
  userId: string,
  createdAt: Date,
  lastLogin: Date,
) {
  if (createdAt.getTime() === lastLogin.getTime()) {
    await transaction.settings.create({
      data: {
        userId: userId,
      },
    });
  }
}

async function createDefaultTimetablesIfNotExist(
  transaction: Prisma.TransactionClient,
  userId: string,
  year: number,
  timetableName: string,
  isGuest: boolean,
) {
  for (const term of Object.values(Term)) {
    let existing = false;
    if (!isGuest) {
      existing =
        (await transaction.timetable.count({
          where: { userId: userId, year: year, term },
        })) > 0;
    }
    if (!existing || isGuest) {
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
