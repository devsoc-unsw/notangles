import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo, UserSettings } from './types';
import type { FriendshipType } from '../graphql/types';
import type { Friendship } from '../graphql/types';

@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateFriendRequest(
    reqId: string,
    recId: string,
    state: FriendshipType,
  ): Promise<void> {
    const data = await this.prisma.friendship.findFirst({
      where: {
        user1Id: reqId > recId ? reqId : recId,
        user2Id: recId >= reqId ? reqId : recId,
      },
    });

    if (data !== null)
      await this.prisma.friendship.update({
        where: {
          friendshipId: data.friendshipId,
        },
        data: { state: { set: state } },
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
      profilePictureUrl: data.profilePictureUrl ?? undefined,
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
}
