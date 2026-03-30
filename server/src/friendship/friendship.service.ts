import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Friendship, Prisma, Status } from 'src/generated/prisma/client';

@Injectable({})
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserFriendships(userId: string): Promise<Friendship[]> {
    return await this.prisma.friendship.findMany({
      where: {
        status: Status.FRIEND,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  }

  async getUserFriendRequests(userId: string): Promise<Friendship[]> {
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            status: Status.REQ_UID1,
            user1Id: userId,
          },
          {
            status: Status.REQ_UID2,
            user2Id: userId,
          },
        ],
      },
    });
  }

  async getFriendRequestsToUser(userId: string): Promise<Friendship[]> {
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            status: Status.REQ_UID2,
            user1Id: userId,
          },
          {
            status: Status.REQ_UID1,
            user2Id: userId,
          },
        ],
      },
    });
  }

  async acceptFriendRequest(userId: string, otherId: string): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            status: Status.REQ_UID1,
            user1Id: otherId,
            user2Id: userId,
          },
          {
            status: Status.REQ_UID2,
            user1Id: userId,
            user2Id: otherId,
          },
        ],
      },
    });

    if (relationship === null) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.friendship.update({
      where: { id: relationship.id },
      data: { status: Status.FRIEND },
    });
  }

  async deleteRelationship(
    userId: string,
    otherId: string,
    // true if the current user initiated the action (cancel/reject from their side)
    requestedByUser: boolean,
  ): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            status: Status.REQ_UID1,
            user1Id: requestedByUser ? userId : otherId,
            user2Id: requestedByUser ? otherId : userId,
          },
          {
            status: Status.REQ_UID2,
            user1Id: requestedByUser ? otherId : userId,
            user2Id: requestedByUser ? userId : otherId,
          },
        ],
      },
    });

    if (relationship === null) return;
    await this.prisma.friendship.delete({
      where: { id: relationship.id },
    });
  }

  async deleteFriendship(userId: string, otherId: string): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        status: Status.FRIEND,
        user1Id: userId < otherId ? userId : otherId,
        user2Id: userId < otherId ? otherId : userId,
      },
    });

    if (relationship === null) return;
    await this.prisma.friendship.delete({
      where: { id: relationship.id },
    });
  }

  async fetchUserFriendCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { inviteCode: true },
    });

    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user.inviteCode;
  }

  async createRelationship(userId: string, otherId: string): Promise<void> {
    const isOrdered = userId < otherId;

    try {
      await this.prisma.friendship.create({
        data: {
          user1Id: isOrdered ? userId : otherId,
          user2Id: isOrdered ? otherId : userId,
          status: isOrdered ? Status.REQ_UID1 : Status.REQ_UID2,
        },
      });
    } catch (e) {
      // Prisma duplicate error is expected
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'A relationship already exists between these users',
            HttpStatus.CONFLICT,
          );
        }
      }
      throw e; // rethrow unexpected errors
    }
  }
}
