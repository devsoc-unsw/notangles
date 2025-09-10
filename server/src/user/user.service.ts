import { Injectable } from '@nestjs/common';
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
    const code = await this.prisma.user.findFirst({
      where: {
        inviteCode: inviteCode,
      },
      select: {
        inviteCode: true,
      },
    });

    return code !== null;
  }

  // Note: this does NOT guarantee uniqueness
  private generateInviteCode(): string {
    return new Array(6)
      .fill(undefined)
      .map(() =>
        Math.floor(Math.random() * 36)
          .toString(36)
          .toUpperCase(),
      )
      .join('');
  }

  async generateUniqueInviteCode(): Promise<string> {
    let code = this.generateInviteCode();
    while (this.isInviteCodeAlreadyUsed(code)) {
      code = this.generateInviteCode();
    }
    return code;
  }
}
