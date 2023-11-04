import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString() @IsNotEmpty() code: string;

  @IsString() @IsNotEmpty() state: string;
}
