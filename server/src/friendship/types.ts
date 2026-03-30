export class CreateFriendRequestDto {
  requesteeCode: string;
}

export class CancelFriendRequestDto {
  requesteeCode: string;
}

export class AcceptFriendRequestDto {
  requestorCode: string;
}

export class RejectFriendRequestDto {
  requestorCode: string;
}

export class RemoveFriendDto {
  otherCode: string;
}
