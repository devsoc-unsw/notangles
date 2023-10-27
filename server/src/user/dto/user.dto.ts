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

export class UserDTO {
  @IsString()
  zid: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  profileURL: string;

  @IsISO8601()
  createdAt: string;

  @IsISO8601()
  lastLogin: string;

  @IsBoolean()
  loggedIn: boolean;

  @IsArray()
  friends: string[];

  @IsOptional()
  settings?: SettingsDto;

  @IsArray()
  timetables: TimetableDto[];
}
