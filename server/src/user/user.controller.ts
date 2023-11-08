import { Controller, Get, Put, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { EventDto, SettingsDto, TimetableDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  async getUserInfo(@Param('userId') userId: string) {
    try {
      return this.userService.getUserInfo(userId);
    } catch (e) {
      return e;
    }
  }

  @Get('settings/:userId')
  async getUserSettings(@Param('userId') userId: string) {
    return this.userService.getUserSettings(userId);
  }

  @Put('settings')
  async setUserSettings(
    @Body('userId') userId: string,
    @Body('setting') setting: SettingsDto,
  ) {
    this.userService.setUserSettings(userId, setting);
  }

  @Get('timetable/:userId')
  async getUserTimetables(@Param('userId') userId: string) {
    return null;
  }

  @Post('timetable')
  async createUserTimetable(
    @Body('zid') zid: string,
    @Body('timetableName') timetableName: string,
    @Body('timetableId') timetableId: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: any[], // change type later
    @Body('createdEvents') createdEvents: EventDto[],
  ) {
    console.log(timetableId, selectedCourses, selectedClasses, createdEvents);
  }

  @Put('timetable')
  async editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    console.log(userId, timetable);
  }
}
