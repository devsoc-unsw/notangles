import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { Timetable, Settings, UserInterface } from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from '../database/database.service';
import {
  FriendRequestDto,
  UserSettingsDto,
  UserTimetablesDto,
} from '../database/dtos/database.dto';
import { User } from '@sentry/node';

@Controller('friend')
export class FriendController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/:userId')
  async getFriends(@Request() req): Promise<User | null> {
    if (req.query.userId) {
      // user id stuff here
      return this.databaseService.getUser(req.query.userId);
    }
  }

  @Post('/')
  async addFriend(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @Delete('/')
  async deleteFriend(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @Post('/request')
  async sendFriendRequest(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }

  @Post('/request')
  async deleteRequest(
    @Request() req,
    @Body() body: FriendRequestDto,
  ): Promise<void> {
    return;
  }
}
