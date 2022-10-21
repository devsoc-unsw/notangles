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

  /**
   * Return all already added friends for a user.
   */
  @UseGuards(LoginGuard)
  @Get('/:userId')
  async getFriends(@Param('userId') userId: string) {
    return {
      status: 'Successfully found user and their friends list!',
      data: await this.friendService.getFriends(userId),
    };
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
   * Search for a user by their userId or by their full name.
   * When searching by the user's full name, each part of the user's name
   * must be separated by underscores
   */
  @UseGuards(LoginGuard)
  @Get('/search')
  async search(@Request() req) {
    const createUser = async (
      user: any,
      currUserId: string,
      userId: string,
    ) => ({
      ...user,
      isFriends: await this.userService.isAlreadyFriends(currUserId, userId),
      hasSentRequest: await this.friendService.hasSentRequest(
        currUserId,
        userId,
      ),
    });

    if (req.query.userId) {
      const user = await this.userService.getUserById(req.query.userId);
      return {
        status: 'Successfully found user!',
        data: await createUser(user, req.user.userId, user.userId),
      };
    } else if (req.query.name) {
      const users = await this.userService.getUserByFullName(req.query.name);
      return {
        status: 'Successfully found users!',
        data: users.map(
          async (user) => await createUser(user, req.user.userId, user.userId),
        ),
      };
    }
  }

  /**
   * Get a user's incoming and outgoing friend requests
   */
  @UseGuards(LoginGuard)
  @Get('/request/:userId')
  async getFriendRequests(@Param('userId') userId: string) {
    return {
      status: 'Successfully found user and their friend requests!',
      data: {
        sentReq: await this.friendService.getSentFriendRequests(userId),
        recvReq: await this.friendService.getRecvFriendRequests(userId),
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

    const isFriended = await this.userService.isAlreadyFriends(
      senderId,
      sendeeId,
    );

    const alreadySentRequest = await this.friendService.hasSentRequest(
      senderId,
      sendeeId,
    );

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

    const isFriended: boolean = await this.userService.isAlreadyFriends(
      senderId,
      sendeeId,
    );

    const alreadySentRequest = await this.friendService.hasSentRequest(
      sendeeId,
      senderId,
    );

    if (!isFriended && alreadySentRequest) {
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
