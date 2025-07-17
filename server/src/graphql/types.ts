export class Friendship {
  friendshipId: string;
  user1Id: string;
  user2Id: string;
  state: FriendshipType;
}

export enum FriendshipType {
  requestedByUser1 = 'requestedByUser1',
  requestedByUser2 = 'requestedByUser2',
  mutual = 'mutual',
}
