import { Controller, Get, Put, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { EventDto, SettingsDto, TimetableDto, UserDTO } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  getUserInfo(@Param('userId') userId: string) {
    try {
      return this.userService.getUserInfo(userId);
    } catch (e) {
      return e;
    }
  }

  // Route is WIP, but had to prototype, otherwise database integrity checks will prevent anything from being added to DB
  // Note that userDTO is not the body arg type as it has superfluous information (eg. timetable, settings - these are added in other routes)
  @Put('profile')
  setUserInfo(
    @Body('userId') userId: string,
    @Body('email') email: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
  ) {
    try {
      return this.userService.setUserProfile(
        userId,
        email,
        firstName,
        lastName,
      );
    } catch (e) {
      return e;
    }
  }

  @Get('settings/:userId')
  getUserSettings(@Param('userId') userId: string) {
    return this.userService.getUserSettings(userId);
  }

  @Put('settings')
  // @UsePipes(new ValidationPipe({ transform: true }))
  setUserSettings(
    @Body('userId') userId: string,
    @Body('setting') setting: any, //SettingsDto, // This aint working - temp solution, should try transforming this class
  ) {
    try {
      return this.userService.setUserSettings(userId, setting).then((res) => {
        return {
          status: 'Successfully edited user settings!',
          data: res,
        };
      });
    } catch (e) {
      return e;
    }
  }

  @Get('timetable/:userId')
  getUserTimetables(@Param('userId') userId: string) {
    return null;
  }

  @Post('timetable')
  createUserTimetable(
    // Isn't this one randomly generated?
    // @Body('timetableId') timetableId: string,
    @Body('userId') userId: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: any[], // change type later
    @Body('createdEvents') createdEvents: EventDto[],
  ) {
    console.log(selectedCourses, selectedClasses, createdEvents);
  }

  @Put('timetable')
  editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    console.log(userId, timetable);
  }
}
