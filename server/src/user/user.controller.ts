import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClassDto, EventDto, InitUserDTO, TimetableDto } from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:userId')
  getUserInfo(@Param('userId') userId: string) {
    return this.userService.getUserInfo(userId).then((data) => {
      return {
        status: 'Successsfully returned user profile',
        data: { ...data, userID: userId },
      };
    });
  }

  @Put('profile')
  setUserInfo(@Body('data') data: InitUserDTO) {
    return this.userService.setUserProfile(data).then((res) => {
      return {
        status: 'Successfully created user!',
        data: res,
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
    @Body('setting') setting: any, //SettingsDto
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
      return { status: `Successfully found user's timetables`, data };
    });
  }

  @Post('timetable')
  createUserTimetable(
    @Body('userId') userId: string,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: ClassDto[],
    @Body('createdEvents') createdEvents: EventDto[],
    @Body('mapKey') mapKey: string,
    @Body('name') timetableName?: string,
  ) {
    return this.userService
      .createUserTimetable(
        userId,
        selectedCourses,
        selectedClasses,
        createdEvents,
        mapKey,
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
  async editUserTimetable(
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    console.log(timetable);
    return this.userService.editUserTimetable(userId, timetable).then((id) => {
      return {
        status: 'Successfully edited timetable',
        data: { id },
      };
    });
  }

  @Delete('timetable/:timetableId')
  deleteUserTimetable(@Param('timetableId') timetableId: string) {
    console.log('deleting timetable');
    return this.userService.deleteUserTimetable(timetableId).then((id) => {
      return {
        status: 'Successfully deleted timetable',
        data: { timetableId: id },
      };
    });
  }

  @Get('group/:userId')
  getUserGroups(@Param('userId') userId: string) {
    try {
      return this.userService.getGroups(userId).then((groups) => {
        return {
          status: `Successsfully returned groups ${userId} is apart of`,
          data: { groups },
        };
      });
    } catch (e) {
      return e;
    }
  }

  @Get('all')
  getAllUsers() {
    try {
      return this.userService.getAllUsers().then((data) => {
        return {
          status: 'Successsfully returned user profile',
          data,
        };
      });
    } catch (e) {
      return e;
    }
  }
}
