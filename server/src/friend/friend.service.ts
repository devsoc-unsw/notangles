import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaService();
@Injectable({})
export class FriendService {
  async findAllFriends(userId: string) {
    try {
      const res = await prisma.user.findUniqueOrThrow({
        where: { userId },
        select: {
          friends: true,
        },
      });

      return res.friends;
    } catch (e) {
      throw new Error();
    }
  }

  async friendUsers(senderId: string, sendeeId: string): Promise<string> {
    try {
      // How defensive should we be (checking if senderId exists, checking if sendee is already a friend)?
      if (senderId === sendeeId) {
        throw new Error('Cannot friend yourself');
      }

      await prisma.$transaction([
        prisma.user.update({
          where: {
            userId: senderId,
          },
          data: {
            friends: {
              connect: {
                userId: sendeeId,
              },
            },
          },
        }),
        prisma.user.update({
          where: {
            userId: sendeeId,
          },
          data: {
            friends: {
              connect: {
                userId: senderId,
              },
            },
          },
        }),
      ]);

      return Promise.resolve(sendeeId);
    } catch (e) {
      throw new Error(e);
    }
  }

  async unfriendUsers(senderId: string, sendeeId: string): Promise<string> {
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            userId: senderId,
          },
          data: {
            friends: {
              disconnect: {
                userId: sendeeId,
              },
            },
          },
        }),
        prisma.user.update({
          where: {
            userId: sendeeId,
          },
          data: {
            friends: {
              disconnect: {
                userId: senderId,
              },
            },
          },
        }),
      ]);

      return Promise.resolve(sendeeId);
    } catch (e) {
      throw new Error(e);
    }
  }

  sendFriendRequest(senderId: string, sendeeId: string) {
    return { senderId, sendeeId };
  }

  deleteFriendRequest(requestId: string) {
    return { requestId };
  }
}
