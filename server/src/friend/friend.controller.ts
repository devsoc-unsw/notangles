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
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { LoginGuard } from 'src/auth/login.guard';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { UserService } from 'src/user/user.service';
import { FriendRequestDto } from './dtos/friend.dto';
import { FriendService } from './friend.service';

@Controller('friend')
@UseFilters(HttpExceptionFilter)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  hasSentRequest = async (uId: string, fId: string) => {
    const sentRequests = await this.friendService.getFriendRequests(uId);

    for (const u of sentRequests) {
      if (u.google_uid === fId) return true;
    }

    return false;
  };

  isAlreadyFriends = async (uId: string, fId: string) => {
    const user = await this.userService.getUser(uId);
    return user.friends.includes(fId);
  };

  /**
   * Return all already added friends for a user.
   */
  @UseGuards(LoginGuard)
  @Get('/:userId')
  async getFriends(@Param('userId') userId: string) {
    if (userId) {
      return {
        status: 'Successfully found user and their friends list!',
        data: await this.friendService.getFriends(userId),
      };
    }
  }

  /**
   * Forcefully add two valid users as each others' friends.
   */
  @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;

    return {
      status: 'Successfully added users as friends!',
      data: {
        id: await this.friendService.addFriend(senderId, sendeeId),
      },
    };
  }

  /**
   * Forcefully remove two valid users from being each others' friends.
   */
  @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;

    return {
      status: 'Successfully removed users as friends!',
      data: {
        id: await this.friendService.removeFriend(senderId, sendeeId),
      },
    };
  }

  /**
   * Send a friend request to a user.
   */
  @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;

    const isFriended = await this.isAlreadyFriends(senderId, sendeeId);
    const alreadySentRequest = await this.hasSentRequest(senderId, sendeeId);

    if (!isFriended && !alreadySentRequest) {
      return {
        status: 'Successfully sent friend request!',
        data: {
          id: await this.friendService.sendFriendRequest(senderId, sendeeId),
        },
      };
    }

    let errorStatus = 'Failed to send friend request! ';
    if (isFriended) {
      errorStatus += 'Already friends!';
    } else {
      errorStatus += 'Friend Request already sent!';
    }

    throw new HttpException(errorStatus, HttpStatus.CONFLICT);
  }

  /**
   * Accept a friend request from a valid user.
   */
  @UseGuards(LoginGuard)
  @Put('/request')
  async acceptFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;

    const isFriended: boolean = await this.isAlreadyFriends(senderId, sendeeId);
    if (!isFriended && (await this.hasSentRequest(sendeeId, senderId))) {
      await Promise.all([
        this.friendService.addFriend(sendeeId, senderId),
        this.friendService.declineFriendRequest(senderId, sendeeId),
      ]);

      return {
        status: 'Successfully accepted friend request!',
        data: sendeeId,
      };
    }

    let errorStatus = 'Failed to accept friend request! ';
    if (isFriended) {
      errorStatus += 'Already friends!';
    } else {
      errorStatus += "Friend request doesn't exist!";
    }

    throw new HttpException(errorStatus, HttpStatus.CONFLICT);
  }

  /**
   * Decline a friend request from a valid user.
   */
  @UseGuards(LoginGuard)
  @Delete('/request')
  async deleteFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;

    return {
      status: 'Successfully removed friend request!',
      data: {
        id: await this.friendService.declineFriendRequest(senderId, sendeeId),
      },
    };
  }
}
