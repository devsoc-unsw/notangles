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
import {
  Timetable,
  Settings,
  UserInterface,
  User,
} from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { LoginGuard } from 'src/auth/login.guard';
import { UserSettingsDto, UserTimetablesDto } from '../user/dtos/user.dto';
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
  /**
   * Get all friend requests for a user given their google user Id.
   */
  async getFriends(@Request() req): Promise<User[]> {
    if (req.params.userId) {
      return this.friendService.getFriends(req.params.userId);
    }
  }

  // @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(@Body() body: SingleFriendRequestDto): Promise<User[]> {
    return this.friendService.addFriend(body.sentRequestTo, body.userId);
  }

  // @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(@Body() body: SingleFriendRequestDto): Promise<User[]> {
    return this.friendService.removeFriend(body.sentRequestTo, body.userId);
  }

  // @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    // Initially, a check is made to see
    // if the user has already sent a friend request to the other user and viceversa
    // So we can add them as friends.

    const hasUserAsentReqToB = async (
      uId: string,
      fId: string,
    ): Promise<boolean> => {
      /**
       * After getting the user's friend requests, we check if the
       * intented friendId is in the requests array. If it is, we
       * set the return type as true.
       */
      const getUserFriendReqs: User[] =
        await this.friendService.getFriendRequests(uId);

      const hasUserSentFriendReq: boolean =
        fId in [getUserFriendReqs.forEach((user) => user.google_uid)];
      return hasUserSentFriendReq;
    };

    let [recv, sent]: [boolean, boolean] = await Promise.all([
      hasUserAsentReqToB(body.userId, body.sentRequestTo),
      hasUserAsentReqToB(body.sentRequestTo, body.userId),
    ]);

    if (recv && sent) {
      // Add them as friends, and concurrently clean up the friend requests collection.
      await Promise.all([
        this.friendService.addFriend(body.sentRequestTo, body.userId),
        this.friendService.declineFriendRequest(
          body.userId,
          body.sentRequestTo,
        ),
      ]);
    } else {
      // One person or neither has not sent a friend Request to the other.
      this.friendService.sendFriendRequest(body.userId, body.sentRequestTo);
    }

    return this.friendService.getFriendRequests(body.userId);
  }

  // @UseGuards(LoginGuard)
  @Delete('/request')
  async deleteFriendRequest(
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    this.friendService.declineFriendRequest(body.sentRequestTo, body.userId);
    return this.friendService.getFriendRequests(body.userId);
  }
}
