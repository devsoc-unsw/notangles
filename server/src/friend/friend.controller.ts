import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Timetable, Settings, UserInterface } from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { LoginGuard } from 'src/auth/login.guard';
import { UserSettingsDto, UserTimetablesDto } from '../user/dtos/user.dto';

import { FriendRequestDto } from './dtos/friend.dto';

import { User } from '@sentry/node';
import { FriendService } from './friend.service';
import { UserService } from 'src/user/user.service';

@Controller('friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LoginGuard)
  @Get('/:userId')
  async getFriends(@Request() req): Promise<User | null> {
    if (req.query.userId) {
      // user id stuff here
      return this.userService.getUser(req.query.userId);
    }
  }

  @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @UseGuards(LoginGuard)
  @Post('/request')
  async deleteRequest(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }
}
