import { Controller, Get, Put, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { EventDto, SettingsDto, TimetableDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  getUserInfo(@Param('userId') userId: string) {
    return this.userService.getUserInfo(userId);
  }

  @Get('settings/:userId')
  getUserSettings(@Param('userId') userId: string) {
    return this.userService.getUserSettings(userId);
  }

  @Put('settings')
  setUserSettings(
    @Body('userId') userId: string,
    @Body('setting') setting: SettingsDto,
  ) {
    this.userService.setUserSettings(userId, setting);
  }

  @Get('timetable/:userId')
  getUserTimetables(@Param('userId') userId: string) {
    return null;
  }

  @Post('timetable')
  createUserTimetable(
    @Body('timetableId') timetableId: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: any[], // change type later
    @Body('createdEvents') createdEvents: EventDto[],
  ) {
    console.log(timetableId, selectedCourses, selectedClasses, createdEvents);
  }

  @Put('timetable')
  editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    console.log(userId, timetable);
  }
}
