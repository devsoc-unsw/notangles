import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { LoginGuard } from 'src/auth/login.guard';

import { Settings, User } from 'src/schemas/user.schema';
import { UserSettingsDto, UserTimetablesDto } from './dtos/user.dto';

import { UserService } from './user.service';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';

@Controller('user')
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  validateResourceResponse(resourceRequested, errorMsg: string) {
    if (resourceRequested) {
      return resourceRequested;
    } else {
      throw new HttpException(errorMsg, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get the user object.
   */
  @UseGuards(LoginGuard)
  @Get('/profile/:userId')
  async user(@Param('userId') userId: string) {
    const userQueried = await this.userService.getUser(userId);
    return {
      status: 'Successfully found user!',
      data: this.validateResourceResponse(userQueried, 'User was not found!'),
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
   * [Utility]
   * Get users in collection.
   * @returns Promise to an array of users.
   */
  @Get('/users')
  async users(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  /**
   * Get the user settings.
   */
  @UseGuards(LoginGuard)
  @Get('/settings/:userId')
  async getSettings(@Param('userId') userId: string) {
    return {
      status: 'Successfully found user and their settings!',
      data: await this.userService.getSettings(userId),
    };
  }

  /**
   * Edit/Create user settings.
   */
  @UseGuards(LoginGuard)
  @Post('/settings/:userId')
  async createSettings(
    @Param('userId') userId: string,
    @Body() body: UserSettingsDto,
  ) {
    return {
      status: 'Successfully edited user settings!',
      data: {
        id: await this.userService.createSettings(body, userId),
      },
    };
  }

  /**
   * Get the user's timetables.
   * @returns Promise to the user's timetables.
   */
  @UseGuards(LoginGuard)
  @Get('/timetable/:userId')
  async getTimetable(@Param('userId') userId: string) {
    return {
      status: 'Successfully found user and their timetables!',
      data: await this.userService.getTimetables(userId),
    };
  }

  /**
   * Create a timetable for the user.
   */

  @UseGuards(LoginGuard)
  @Post('/timetable/:userId')
  async createTimetable(
    @Param('userId') userId: string,
    @Body() body: UserTimetablesDto,
  ) {
    return {
      status: 'Successfully found user and created their new timetable!',
      data: await this.userService.createTimetable(body, userId),
    };
  }

  /**
   * Edit the user's timetable.
   */
  @UseGuards(LoginGuard)
  @Put('/timetable/:userId')
  async editTimetable(
    @Param('userId') userId: string,
    @Body() body: UserTimetablesDto,
  ) {
    return {
      status: 'Successfully Edited timetable',
      data: {
        id: await this.userService.editTimetable(userId, body),
      },
    };
  }

  /**
   * Delete a particular timetable from the user's timetables.
   */
  @UseGuards(LoginGuard)
  @Delete('/timetable/:userId/:timetableId')
  async deleteTimetable(
    @Param('userId') userId: string,
    @Param('timetableId') timetableId: string,
  ) {
    return {
      status: 'Successfully deleted timetable',
      data: {
        id: await this.userService.deleteTimetable(userId, timetableId),
      },
    };
  }
}
