import {
  Controller,
  Get,
  Put,
  Param,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ClassDto, EventDto, InitUserDTO, TimetableDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  getUserInfo(@Param('userId') userId: string) {
    return this.userService.getUserInfo(userId).then((data) => {
      return {
        status: 'Successsfully returned user profile',
        data,
      };
    });
  }

  @Put('profile')
  setUserInfo(@Body('data') data: InitUserDTO) {
    return this.userService.setUserProfile(data).then((res) => {
      return {
        status: 'Successfully created user!',
        res,
      };
    });
  }

  @Get('settings/:userId')
  getUserSettings(@Param('userId') userId: string) {
    return this.userService.getUserSettings(userId).then((data) => {
      return {
        status: 'Successfully found user and their settings!',
        data,
      };
    });
  }

  @Put('settings')
  // @UsePipes(new ValidationPipe({ transform: true }))
  setUserSettings(
    @Body('userId') userId: string,
    @Body('setting') setting: any, //SettingsDto, // This aint working - temp solution, should try transforming this class
  ) {
    return this.userService.setUserSettings(userId, setting).then((data) => {
      return {
        status: 'Successfully edited user settings!',
        data,
      };
    });
  }

  @Get('timetable/:userId')
  getUserTimetables(@Param('userId') userId: string) {
    return this.userService.getUserTimetables(userId).then((data) => {
      return { status: `Successfully found user's timetable`, data };
    });
  }

  // Could look to change params to just TimetableDTO (this would involve making timetableId optional - is this desired?)
  @Post('timetable')
  createUserTimetable(
    @Body('userId') userId: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: ClassDto[], // change type later
    @Body('createdEvents') createdEvents: EventDto[],
    @Body('timetableName') timetableName?: string,
  ) {
    return this.userService
      .createUserTimetable(
        userId,
        selectedCourses,
        selectedClasses,
        createdEvents,
        timetableName,
      )
      .then((res) => {
        return {
          status: 'Successfully found user and created their new timetable!',
          data: res,
        };
      });
  }

  @Put('timetable')
  editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    return this.userService.editUserTimetable(userId, timetable).then((id) => {
      return {
        status: 'Successfully edited timetable',
        data: { id },
      };
    });
  }

  // Note - why do we need userId as a param? https://devsoc.atlassian.net/wiki/spaces/N/pages/1575168/Notangles+API
  @Delete('timetable/:timetableId')
  deleteUserTimetable(@Param('timetableId') timetableId: string) {
    return this.userService.deleteUserTimetable(timetableId).then((id) => {
      return {
        status: 'Successfully deleted timetable',
        data: { timetableId: id },
      };
    });
  }
}
