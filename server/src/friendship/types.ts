export class CreateFriendRequestDto {
  requesteeCode: string;
}

export class AcceptFriendRequestDto {
  requestorId: string;
}

export class RemoveFriendDto {
  friendId: string;
}

export class FriendInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
}
