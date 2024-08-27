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
      throw new Error(e);
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
            userID: senderId,
          },
          data: {
            friends: {
              connect: {
                userID: sendeeId,
              },
            },
          },
        }),
        prisma.user.update({
          where: {
            userID: sendeeId,
          },
          data: {
            friends: {
              connect: {
                userID: senderId,
              },
            },
          },
        }),
      ]);

      // Need to delete friend request
      this.deleteFriendRequest(sendeeId, senderId);

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

  // Note: This can also serve as accepting a friend req (lmk if we should decouple these functions)
  async sendFriendRequest(senderId: string, sendeeId: string) {
    // Again, how defensive should we be (could potentially add blocking friend reqs to already friended users)
    try {
      if (senderId === sendeeId) {
        throw new Error('Cannot friend yourself');
      }

      // Check if there's corresponding incoming request first
      const isIncoming = await prisma.user.findFirst({
        where: {
          userID: senderId,
          incoming: {
            some: {
              userID: sendeeId,
            },
          },
        },
      });

      let status;
      // If so, we can just friend them
      if (isIncoming) {
        // Reversed order because the current sender has an incoming req, so they are the "sendee" of that transaction
        await this.deleteFriendRequest(sendeeId, senderId);
        await this.friendUsers(senderId, sendeeId);
        status = 'Successfully accepted friend request';
      } else {
        // Else, send outgoing friend request
        await prisma.user.update({
          where: {
            userID: senderId,
          },
          data: {
            outgoing: {
              connect: {
                userID: sendeeId,
              },
            },
          },
        });
        status = 'Successfully sent friend request';
      }

      return Promise.resolve({
        status,
        sendeeId,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  // sendee = receiver = incoming (f-req is coming into the sendee, so sendee is the id of user who made this api req)
  async deleteFriendRequest(senderId: string, sendeeId: string) {
    try {
      await prisma.user.update({
        where: {
          userID: sendeeId,
        },
        data: {
          incoming: {
            disconnect: {
              userID: senderId,
            },
          },
        },
      });
      return Promise.resolve(senderId);
    } catch (e) {
      throw new Error(e);
    }
  }
}
