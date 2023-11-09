import { Controller, Get, Put, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ClassDto, EventDto, SettingsDto, TimetableDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  async getUserInfo(@Param('userId') userId: string) {
    try {
      return await this.userService.getUserInfo(userId);
    } catch (e) {
      return e;
    }
  }

  @Get('settings/:userId')
  async getUserSettings(@Param('userId') userId: string) {
    return await this.userService.getUserSettings(userId);
  }

  @Put('settings')
  async setUserSettings(
    @Body('userId') userId: string,
    @Body('setting') setting: SettingsDto,
  ) {
    return await this.userService.setUserSettings(userId, setting);
  }

  @Get('timetable/:userId')
  async getUserTimetables(@Param('userId') userId: string) {
    return await this.userService.getUserTimetables(userId);
  }

  @Post('timetable')
  async createUserTimetable(
    @Body('zid') zid: string,
    @Body('timetableName') timetableName: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: ClassDto[], // change type later
    @Body('createdEvents') createdEvents: EventDto[],
  ) {
    return await this.userService.createUserTimetable(
      zid,
      timetableName,
      selectedCourses,
      selectedClasses,
      createdEvents,
    );
  }

  @Put('timetable')
  async editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    return await this.userService.editUserTimetable(userId, timetable);
  }
}
