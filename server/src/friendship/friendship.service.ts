import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Friendship } from 'src/generated/prisma/client';

@Injectable({})
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}
  // send request [x]
  // cancel request    ==> deleteRelationship
  // see outgoing [X]
  // see incoming [X]
  // accept request [X]
  // reject request [x] ==> deleteRelationship
  // remove existing [x] ==> deleteRelationship
  // reset friendcode ==> in user module

  // Returns the status string of the ORIGINAL parameter.
  private async doesRelationshipExist(
    user1Id: string,
    user2Id: string,
  ): Promise<string | undefined> {
    const doSwap = user1Id < user2Id;

    [user1Id, user2Id] = doSwap ? [user1Id, user2Id] : [user2Id, user1Id];

    const friendship = await this.prisma.friendship.findUnique({
      where: {
        user1Id_user2Id: { user1Id: user1Id, user2Id: user2Id },
      },
    });

    if (friendship == undefined) return undefined;
    if (friendship?.status == 'FRIEND') return 'FRIEND';

    let ret;
    if (!doSwap) ret = friendship?.status;
    else ret = friendship?.status == 'REQ_UID1' ? 'REQ_UID2' : 'REQ_UID1';
    return ret;
  }
  async getUserFriendships(userId: string): Promise<Friendship[]> {
    return await this.prisma.friendship.findMany({
      where: {
        status: 'FRIEND',
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });
  }

  async getUserFriendRequests(userId: string): Promise<Friendship[]> {
    // Infulences the ordering ==> Should re-order in the future
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            status: 'REQ_UID1',
            user1Id: userId,
          },
          {
            status: 'REQ_UID2',
            user2Id: userId,
          },
        ],
      },
    });
  }

  async getFriendRequestsToUser(userId: string): Promise<Friendship[]> {
    // Infulences the ordering ==> Should re-order in the future
    return await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            status: 'REQ_UID2',
            user1Id: userId,
          },
          {
            status: 'REQ_UID1',
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
            status: 'REQ_UID1',
            user1Id: otherId,
            user2Id: userId,
          },
          {
            status: 'REQ_UID2',
            user1Id: userId,
            user2Id: otherId,
          },
        ],
      },
    });
    // TODO: How to handle this proplery?
    if (relationship === null) return;

    await this.prisma.friendship.update({
      where: { id: relationship.id },
      data: { status: 'FRIEND' },
    });
  }

  async deleteRelationship(
    userId: string,
    otherId: string,
    requestedByUser: boolean,
  ): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          {
            status: 'REQ_UID1',
            user1Id: requestedByUser ? userId : otherId,
            user2Id: requestedByUser ? otherId : userId,
          },
          {
            status: 'REQ_UID2',
            user1Id: requestedByUser ? otherId : userId,
            user2Id: requestedByUser ? userId : otherId,
          },
        ],
      },
    });

    if (relationship === undefined) return;
    await this.prisma.friendship.delete({
      where: { id: relationship?.id },
    });
  }

  async deleteFriendship(userId: string, otherId: string): Promise<void> {
    const relationship = await this.prisma.friendship.findFirst({
      where: {
        status: 'FRIEND',
        user1Id: userId < otherId ? userId : otherId,
        user2Id: userId < otherId ? otherId : userId,
      },
    });

    if (relationship === undefined) return;
    await this.prisma.friendship.delete({
      where: { id: relationship?.id },
    });
  }

  async fetchUserFriendCode(userId: string): Promise<string> {
    const inviteCode = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { inviteCode: true },
    });

    if (inviteCode === null) {
      throw new HttpException(
        '[fetchUserFriendCode]: no inviteCode found!',
        HttpStatus.NOT_FOUND,
      );
    }
    return inviteCode.inviteCode;
  }

  async createRelationship(userId: string, otherId: string): Promise<void> {
    const isOrdered = userId < otherId;
    const statusIfExists = await this.doesRelationshipExist(userId, otherId);

    if (statusIfExists !== undefined) {
      throw new HttpException(
        '[createRelationship]: relationship already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.friendship.create({
      data: {
        user1Id: isOrdered ? userId : otherId,
        user2Id: isOrdered ? otherId : userId,
        status: isOrdered ? 'REQ_UID1' : 'REQ_UID2',
      },
    });
  }
}
