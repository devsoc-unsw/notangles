import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { LoginGuard } from 'src/auth/login.guard';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import {
  UserDeleteTimetableQueryDto,
  UserSettingsQueryDto,
  UserTimetablesQueryDto,
} from './dtos/user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get the user object.
   */
  @UseGuards(LoginGuard)
  @Get('/profile/:userId')
  async user(@Param('userId') userId: string) {
    return {
      status: 'Successfully found user!',
      data: await this.userService.getUser(userId),
    };
  }

  /**
   * Search for a user by their googleId or by their full name.
   */
  @UseGuards(LoginGuard)
  @Get('/search')
  async userSearch(@Request() req) {
    if (req.query.userId) {
      return {
        status: 'Successfully found user!',
        data: await this.userService.getUser(req.query.userId),
      };
    } else if (req.query.userFullName) {
      return {
        status: 'Successfully found user!',
        data: await this.userService.getUserByFullName(req.query.userFullName),
      };
    }
  }

  /**
   * Get the user settings.
   */
  @UseGuards(LoginGuard)
  @Get('/settings/:userId')
  async getSettings(@Param('userId') userId: string) {
    return {
      status: "Successfully found user's settings!",
      data: await this.userService.getSettings(userId),
    };
  }

  /**
   * Edit/Create user settings.
   */
  @UseGuards(LoginGuard)
  @Post('/settings')
  async createSettings(@Body() body: UserSettingsQueryDto) {
    const { userId, setting } = body;
    return {
      status: 'Successfully edited user settings!',
      data: {
        id: await this.userService.createSettings(setting, userId),
      },
    };
  }

  /**
   * Get the user's timetables.
   */
  @UseGuards(LoginGuard)
  @Get('/timetable/:userId')
  async getTimetable(@Param('userId') userId: string) {
    return {
      status: "Successfully found user's timetables!",
      data: await this.userService.getTimetables(userId),
    };
  }

  /**
   * Create a timetable for the user.
   */
  @UseGuards(LoginGuard)
  @Post('/timetable')
  async createTimetable(@Body() body: UserTimetablesQueryDto) {
    const { userId, timetable } = body;
    return {
      status: 'Successfully found user and created their new timetable!',
      data: await this.userService.createTimetable(timetable, userId),
    };
  }

  /**
   * Edit the user's timetable.
   */
  @UseGuards(LoginGuard)
  @Put('/timetable')
  async editTimetable(@Body() body: UserTimetablesQueryDto) {
    const { userId, timetable } = body;
    return {
      status: 'Successfully Edited timetable',
      data: {
        id: await this.userService.editTimetable(userId, timetable),
      },
    };
  }

  /**
   * Delete a particular timetable from the user's timetables.
   */
  @UseGuards(LoginGuard)
  @Delete('/timetable')
  async deleteTimetable(@Body() body: UserDeleteTimetableQueryDto) {
    const { userId, timetableId } = body;
    return {
      status: 'Successfully deleted timetable',
      data: {
        id: await this.userService.deleteTimetable(userId, timetableId),
      },
    };
  }
}
