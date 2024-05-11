import { Injectable } from '@nestjs/common';

@Injectable({})
export class FriendService {
  findAllFriends(userId: string) {
    return { friends: 'none tbh.' };
  }

  friendUsers(senderId: string, sendeeId: string) {
    return { senderId, sendeeId };
  }

  unfriendUsers(senderId: string, sendeeId: string) {
    return { senderId, sendeeId };
  }

  sendFriendRequest(senderId: string, sendeeId: string) {
    return { senderId, sendeeId };
  }

  deleteFriendRequest(requestId: string) {
    return { requestId };
  }
}
