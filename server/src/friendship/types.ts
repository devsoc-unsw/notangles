// todo: Should these be combined or kept explicit?
// Im just doing this explicit but now but will combine them :D
// Union types?

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
