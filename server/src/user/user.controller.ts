import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClassDto, EventDto, InitUserDTO, TimetableDto } from './dto';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('profile/:userId')
  getUserInfo(@Request() req, @Param('userId') userId: string) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only access your own profile information.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.getUserInfo(userId).then((data) => {
      return {
        status: 'Successsfully returned user profile',
        data: { ...data, userID: userId },
      };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Put('profile')
  setUserInfo(@Request() req, @Body('data') data: InitUserDTO) {
    if (!req.user || data.userID !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only edit your own profile information.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.setUserProfile(data).then((res) => {
      return {
        status: 'Successfully created user!',
        data: res,
      };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('settings/:userId')
  getUserSettings(@Request() req, @Param('userId') userId: string) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only access your own settings.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.getUserSettings(userId).then((data) => {
      return {
        status: 'Successfully found user and their settings!',
        data,
      };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Put('settings')
  // @UsePipes(new ValidationPipe({ transform: true }))
  setUserSettings(
    @Request() req,
    @Body('userId') userId: string,
    @Body('setting') setting: any, //SettingsDto
  ) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only edit your own settings.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.setUserSettings(userId, setting).then((data) => {
      return {
        status: 'Successfully edited user settings!',
        data,
      };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('timetable/:userId')
  getUserTimetables(@Request() req, @Param('userId') userId: string) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only access your own timetables.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.getUserTimetables(userId).then((data) => {
      return { status: `Successfully found user's timetables`, data };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Post('timetable')
  createUserTimetable(
    @Request() req,
    @Body('userId') userId: string,
    @Body('isPrimary') isPrimary: boolean,
    @Body('selectedCourses') selectedCourses: string[],
    @Body('selectedClasses') selectedClasses: ClassDto[],
    @Body('createdEvents') createdEvents: EventDto[],
    @Body('mapKey') mapKey: string,
    @Body('name') timetableName?: string,
  ) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only create timetables for your own user.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService
      .createUserTimetable(
        userId,
        isPrimary,
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

  @UseGuards(AuthenticatedGuard)
  @Put('timetable')
  async editUserTimetable(
    @Request() req,
    @Body('userId') userId: string,
    @Body('timetable') timetable: TimetableDto,
  ) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      // This is not really doing anything if the underlying function doesn't make use of the provided userId.
      throw new HttpException(
        'You can only edit timetables for your own user.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.userService.editUserTimetable(userId, timetable).then((id) => {
      return {
        status: 'Successfully edited timetable',
        data: { id },
      };
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('timetable/:timetableId')
  deleteUserTimetable(
    @Request() req,
    @Param('timetableId') timetableId: string,
  ) {
    return this.userService
      .deleteUserTimetable(req.user.userinfo.sub, timetableId)
      .then((id) => {
        return {
          status: 'Successfully deleted timetable',
          data: { timetableId: id },
        };
      });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('group/:userId')
  getUserGroups(@Request() req, @Param('userId') userId: string) {
    if (!req.user || userId !== req.user.userinfo.sub) {
      throw new HttpException(
        'You can only access your own groups.',
        HttpStatus.FORBIDDEN,
      );
    }

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

  // Uncomment this and fix perms when adding groups and friends
  @Get('all')
  getAllUsers() {
    return { status: 'This endpoint is not implemented yet.', data: [] };
    /*
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
    */
  }
}
