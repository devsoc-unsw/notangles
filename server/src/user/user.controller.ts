import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
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

  @Get('/profile/:userId')
  async user(@Request() req): Promise<User | null> {
    return this.userService.getUser(req.params.userId);
  }

  @Get('/search')
  async userSearch(@Request() req): Promise<User | null> {
    if (req.query.userId) {
      return this.userService.getUser(req.query.userId);
    } else if (req.query.userFullName) {
      return this.userService.getUserByFullName(req.query.userFullName);
    }
  }

  // utility function to get all the users in database.

  @Get('/users')
  async users(): Promise<User | null> {
    return this.userService.getAllUsers();
  }

  // @UseGuards(<guardhere>)
  @Get('/settings/:userId')
  async getSettings(@Request() req): Promise<Settings> {
    return this.userService.getSettings(req.params.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/settings/:userId')
  async createSettings(
    @Request() req,
    @Body() body: UserSettingsDto,
  ): Promise<Settings> {
    return this.userService.createSettings(body, req.params.userId);
  }

  // @UseGuards(<guardhere>)
  @Get('/timetable/:userId')
  async getTimetable(@Request() req): Promise<UserTimetablesDto[]> {
    return this.userService.getTimetables(req.params.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/timetable/:userId')
  async createTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    return this.userService.createTimetable(body, req.params.userId);
  }

  // // @UseGuards(<guardhere>)
  // @Put('/timetable/:userId/:timetableId')
  // async editTimetable(
  //   @Request() req,
  //   @Body() body: UserTimetablesDto,
  // ): Promise<UserTimetablesDto[]> {
  //   return this.userService.editTimetable(
  //     body,
  //     req.params.userId,
  //     req.params.timetableId,
  //   );
  // }

  // @UseGuards(<guardhere>)
  // @UseGuards(LoginGuard)
  @Delete('/timetable/:userId/:timetableId')
  async deleteTimetable(@Request() req): Promise<UserTimetablesDto[]> {
    return this.userService.deleteTimetable(
      req.params.userId,
      req.params.timetableId,
    );
  }
}
