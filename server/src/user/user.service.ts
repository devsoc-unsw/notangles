import { Injectable } from '@nestjs/common';
import { SettingsDto, UserDTO, EventDto, TimetableDto } from './dto';

@Injectable()
export class UserService {
  getUserInfo(userId: string): UserDTO {
    return null;
  }

  getUserSettings(userId: string): SettingsDto {
    return null;
  }

  setUserSettings(userId: string, setting: SettingsDto): void {}

  getUserTimetables(userId: string): TimetableDto[] {
    return null;
  }

  createUserTimetable(
    timetableId: string,
    selectedCourses: string[],
    selectedClasses: any[],
    createdEvents: EventDto[],
  ): void {}

  editUserTimetable(userId: string, timetable: TimetableDto): void {}
}
