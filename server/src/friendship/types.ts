export class CreateFriendRequestDto {
  requesteeCode: string;
}

export class CancelFriendRequestDto {
  requesteeId: string;
}

export class AcceptFriendRequestDto {
  requestorId: string;
}

export class RejectFriendRequestDto {
  requestorId: string;
}

export class RemoveFriendDto {
  friendId: string;
}
