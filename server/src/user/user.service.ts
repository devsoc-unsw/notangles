import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo, UserSettings } from './types';

@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      inviteCode: data.inviteCode,
      profilePictureUrl: data.profilePictureUrl ?? undefined,
      isGuest: data.isGuest,
    };
  }

  async setProfilePicture(
    userId: string,
    profilePictureUrl: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePictureUrl,
      },
    });
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        settings: true,
      },
    });

    if (!data.settings) {
      throw new Error('User settings not found');
    }

    return data.settings;
  }

  async setSettings(userId: string, settings: UserSettings): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        settings: {
          update: settings,
        },
      },
    });
  }

  private async isInviteCodeAlreadyUsed(inviteCode: string): Promise<boolean> {
    const code = await this.prisma.user.findUnique({
      where: {
        inviteCode: inviteCode,
      },
      select: {
        inviteCode: true,
      },
    });

    return code !== null;
  }

  // Note: this does NOT guarantee uniqueness, use generateUniqueInviteCode for that.
  private generateInviteCode(): string {
    return new Array(7)
      .fill(undefined)
      .map(() =>
        Math.floor(Math.random() * 36)
          .toString(36)
          .toUpperCase(),
      )
      .join('');
  }

  async generateUniqueInviteCode(): Promise<string> {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const code = this.generateInviteCode();
      if (!(await this.isInviteCodeAlreadyUsed(code))) {
        return code;
      }
    }
    throw new HttpException(
      'Failed to generate a unique invite code',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
