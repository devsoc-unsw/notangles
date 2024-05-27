import {
  IsString,
  IsEmail,
  IsBoolean,
  IsArray,
  IsISO8601,
  IsOptional,
} from 'class-validator';
import { SettingsDto } from './settings.dto';
import { TimetableDto } from './timetable.dto';

export class InitUserDTO {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  profileURL?: string;
}
export class UserDTO extends InitUserDTO {
  @IsISO8601()
  @IsOptional()
  createdAt?: string;

  @IsISO8601()
  @IsOptional()
  lastLogin?: string;

  @IsBoolean()
  loggedIn: boolean;

  @IsArray()
  friends: string[];

  @IsOptional()
  settings?: SettingsDto;

  @IsArray()
  timetables: TimetableDto[];
}
