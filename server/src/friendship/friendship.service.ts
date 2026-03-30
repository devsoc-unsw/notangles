import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Friendship, Prisma, Status } from 'src/generated/prisma/client';

@Injectable()
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
          { status: Status.REQ_UID1, user1Id: userId },
          { status: Status.REQ_UID2, user2Id: userId },
        ],
      },
    });
  }

  async getFriendRequestsToUser(userId: string): Promise<Friendship[]> {
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          { status: Status.REQ_UID2, user1Id: userId },
          { status: Status.REQ_UID1, user2Id: userId },
        ],
      },
    });
  }

  async acceptFriendRequest(
    userId: string,
    requestorId: string,
  ): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { status: Status.REQ_UID1, user1Id: requestorId, user2Id: userId },
          { status: Status.REQ_UID2, user1Id: userId, user2Id: requestorId },
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

  // Cancel an outgoing friend request (called by the user who sent it)
  async cancelFriendRequest(userId: string, otherId: string): Promise<void> {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { status: Status.REQ_UID1, user1Id: userId, user2Id: otherId },
          { status: Status.REQ_UID2, user1Id: otherId, user2Id: userId },
        ],
      },
    });
  }

  // Reject an incoming friend request (called by the user who received it)
  async rejectFriendRequest(
    userId: string,
    requestorId: string,
  ): Promise<void> {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { status: Status.REQ_UID1, user1Id: requestorId, user2Id: userId },
          { status: Status.REQ_UID2, user1Id: userId, user2Id: requestorId },
        ],
      },
    });
  }

  async deleteFriendship(userId: string, otherId: string): Promise<void> {
    const [user1Id, user2Id] =
      userId < otherId ? [userId, otherId] : [otherId, userId];

    // Note: This deletes 0 or more, meaning it will "succeed" even if there is no friendship to delete
    await this.prisma.friendship.deleteMany({
      where: { status: Status.FRIEND, user1Id, user2Id },
    });
  }

  private async resolveInviteCode(inviteCode: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { inviteCode },
      select: { id: true },
    });

    if (user === null) {
      throw new HttpException('Invite code not found', HttpStatus.NOT_FOUND);
    }
    return user.id;
  }

  async createRelationship(
    userId: string,
    requesteeCode: string,
  ): Promise<void> {
    const requesteeId = await this.resolveInviteCode(requesteeCode);

    if (userId === requesteeId) {
      throw new HttpException(
        'Cannot send a friend request to yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isOrdered = userId < requesteeId;

    try {
      await this.prisma.friendship.create({
        data: {
          user1Id: isOrdered ? userId : requesteeId,
          user2Id: isOrdered ? requesteeId : userId,
          status: isOrdered ? Status.REQ_UID1 : Status.REQ_UID2,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new HttpException(
          'A relationship already exists between these users',
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }
}
