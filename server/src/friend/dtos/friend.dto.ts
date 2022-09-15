export class FriendRequestDto {
  userId: string;
  friendId: string;
  constructor(userId: string, friendId: string) {
    this.userId = userId;
    this.friendId = friendId;
  }
}
