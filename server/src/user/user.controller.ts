import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Request,
} from '@nestjs/common';

import { LoginGuard } from 'src/auth/login.guard';

import { Timetable, Settings, UserInterface } from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { UserSettingsDto, UserTimetablesDto } from './dtos/user.dto';
import { User } from '@sentry/node';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  /**
   * Get the user object.
   * If user does not exist, a null is returned.
   * @param req: decorator of the Request route handler param.
   * @returns Promise to a user object or null if user does not exist.
   */
  @Get('/profile/:userId')
  async user(@Request() req): Promise<User> {
    return this.userService.getUser(req.params.userId);
  }

  /**
   * Search for a user by their googleId or by their full name.
   * Please see documentation for the Fullname query.
   * @param req decorator of the Request route handler param.
   * @returns Promise to a user object or null if user does not exist.
   */
  @Get('/search')
  async userSearch(@Request() req): Promise<User> {
    if (req.query.userId) {
      return this.userService.getUser(req.query.userId);
    } else if (req.query.userFullName) {
      return this.userService.getUserByFullName(req.query.userFullName);
    }
  }

  /**
   * [Utility]
   * Get users in collection.
   * @returns Promise to an array of users.
   */
  @Get('/users')
  async users(): Promise<User> {
    return this.userService.getAllUsers();
  }

  /**
   * Get the user settings.
   * @param req decorator of the Request route handler param.
   * @returns Promise to the user's settings
   */
  // @UseGuards(<guardhere>)
  @Get('/settings/:userId')
  async getSettings(@Request() req): Promise<Settings> {
    return this.userService.getSettings(req.params.userId);
  }

  /**
   * Edit/Create user settings.
   * Please see documentation for the UserSettingsDto.
   * @param req: decorator of the Request route handler param.
   * @param body: UserSettingsDto which details user's settings.
   * @returns Promise to the user's settings.
   */
  // @UseGuards(<guardhere>)
  @Post('/settings/:userId')
  async createSettings(
    @Request() req,
    @Body() body: UserSettingsDto,
  ): Promise<Settings> {
    return this.userService.createSettings(body, req.params.userId);
  }

  /**
   * Get the user's timetables.
   * @param req decorator of the Request route handler param.
   * @returns Promise to the user's timetables.
   */
  // @UseGuards(<guardhere>)
  @Get('/timetable/:userId')
  async getTimetable(@Request() req): Promise<UserTimetablesDto[]> {
    return this.userService.getTimetables(req.params.userId);
  }

  /**
   * Create a timetable for the user.
   * @param req: decorator of the Request route handler param.
   * @param body: UserTimetablesDto which details the timetable to be added.
   * @returns Promise to the user's timetables.
   */
  // @UseGuards(<guardhere>)
  @Post('/timetable/:userId')
  async createTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    return this.userService.createTimetable(body, req.params.userId);
  }

  // // @UseGuards(<guardhere>)
  @Put('/timetable/:userId/:timetableId')
  async editTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    return this.userService.editTimetable(
      req.params.userId,
      req.params.timetableId,
    );
  }

  /**
   * Delete a particular timetable from the user's timetables.
   * @param req: decorator of the Request route handler param.
   * @returns Promise to the user's timetables.
   */
  // @UseGuards(LoginGuard)
  @Delete('/timetable/:userId/:timetableId')
  async deleteTimetable(@Request() req): Promise<UserTimetablesDto[]> {
    return this.userService.deleteTimetable(
      req.params.userId,
      req.params.timetableId,
    );
  }
}
