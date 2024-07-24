import { IsNotEmpty, IsString } from 'class-validator';

export class friendDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  sendeeId: string;
}

// export class friendRequestDto {
//   @IsString()
//   @IsNotEmpty()
//   requestId: string;
// }
