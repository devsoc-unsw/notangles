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
import { User } from '@sentry/node';
import { FriendService } from './friend.service';
import { UserService } from 'src/user/user.service';
import { SingleFriendRequestDto } from './dtos/friend.dto';

@Controller('friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  // @UseGuards(LoginGuard)
  @Get('/:userId')
  async getFriends(@Request() req): Promise<User[] | void> {
    if (req.params.userId) {
      return this.friendService.getFriends(req.params.userId);
    }
  }

  // @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(
    @Request() req,
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    this.friendService.addFriend(body.sentRequestTo, body.userId);
    this.friendService.addFriend(body.userId, body.sentRequestTo);
    return this.friendService.getFriends(body.userId);
  }

  // @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(
    @Request() req,
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    this.friendService.removeFriend(body.sentRequestTo, body.userId);
    this.friendService.removeFriend(body.userId, body.sentRequestTo);
    return this.friendService.getFriends(body.userId);
  }

  // @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(
    @Request() req,
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[] | void> {
    const userSentFr: boolean = await this.friendService
      .getFriendRequests(body.userId)
      .then((res) => {
        if (res) {
          return body.userId in res;
        }
      });

    const userReceivedFr: boolean = await this.friendService
      .getFriendRequests(body.sentRequestTo)
      .then((res) => {
        if (res) {
          return body.userId in res;
        }
      });

    if (userSentFr && userReceivedFr) {
      this.friendService.addFriend(body.sentRequestTo, body.userId);
      this.friendService.addFriend(body.userId, body.sentRequestTo);
      // Clean up
      this.friendService.declineFriendRequest(body.userId, body.sentRequestTo);
      this.friendService.declineFriendRequest(body.sentRequestTo, body.userId);
    } else {
      this.friendService.sendFriendRequest(body.userId, body.sentRequestTo);
    }

    return this.friendService.getFriendRequests(body.userId);
  }

  // @UseGuards(LoginGuard)
  @Delete('/request')
  async deleteFriendRequest(
    @Request() req,
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[] | void> {
    this.friendService.declineFriendRequest(body.sentRequestTo, body.userId);
    return this.friendService.getFriendRequests(body.userId);
  }
}
