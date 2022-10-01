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
import { User } from 'src/schemas/user.schema';
import { FriendService } from './friend.service';
import { UserService } from 'src/user/user.service';
import { FriendRequestDto } from './dtos/friend.dto';
import { LoginGuard } from 'src/auth/login.guard';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';

@Controller('friend')
@UseFilters(HttpExceptionFilter)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}
  hasUserAsentReqToB = async (uId: string, fId: string): Promise<boolean> => {
    const getUserFriendReqs: User[] =
      await this.friendService.getFriendRequests(uId);

    for (const u of getUserFriendReqs) {
      if (u.google_uid === fId) {
        return true;
      }
    }
    return false;
  };

  alreadyFriends = async (uId: string, fId: string): Promise<boolean> => {
    const user: User = await this.userService.getUser(uId);
    // Check if they are already friends or not.
    if (user.friends.includes(fId)) {
      return true;
    }
    return false;
  };
  /**
   * Return all already added friends for a user.
   *
   * [Defensively checked for]:
   *  - If the user is not found.
   *
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
   * Forcefully add two valid users as friends.
   *
   * This would remove the friend requests (documents)
   * from their respective collections.
   *
   * [Defensively checked for]:
   *  - The user trying to add themselves as friends.
   *  - Non valid users are not added as friends.
   *
   */
  @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;
    const [sender, sendee] = await Promise.all([
      this.userService.getUser(senderId),
      this.userService.getUser(senderId),
    ]);
    if (!sender || !sendee)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return {
      status: 'Successfully added users as friends!',
      data: {
        id: await this.friendService.addFriend(senderId, sendeeId),
      },
    };
  }

  /**
   * Forcefully remove two valid users from being friends.
   * Bidirectional removal of friendship relation.
   * [Defensively checked for]:
   *  - Non valid users.
   *
   */
  @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;
    const checkValidUser = async (uId: string) => this.userService.getUser(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      return [];
    }
    return {
      status: 'Successfully removed users as friends!',
      data: {
        id: await this.friendService.removeFriend(senderId, sendeeId),
      },
    };
  }

  /**
   * Send a friend request to a valid user.
   * [Defensively checked for]:
   *  - The user trying to add themselves as friends.
   *  - Non valid users are not added as friends.
   *  - If the user has already sent a friend request, or already friends.
   *
   */
  @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;
    // Check for valid users.
    const checkValidUser = async (uId: string) => this.userService.getUser(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      throw new HttpException(
        'Invalid user Ids provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const friended: boolean = await this.alreadyFriends(senderId, sendeeId);
    const alreadySentFr: boolean = await this.hasUserAsentReqToB(
      senderId,
      sendeeId,
    );
    if (!friended && !alreadySentFr) {
      return {
        status: 'Successfully sent friend request!',
        data: {
          id: await this.friendService.sendFriendRequest(senderId, sendeeId),
        },
      };
    }
    // Error handling response.
    let errorStatus = 'Failed to send friend request! ';
    if (friended) {
      errorStatus += 'Already friends!';
    } else {
      errorStatus += 'Friend Request already sent!';
    }
    throw new HttpException(
      {
        status: errorStatus,
        data: sendeeId,
      },
      HttpStatus.CONFLICT,
    );
  }

  /**
   * Send a friend request to a valid user.
   * [Defensively checked for]:
   *  - The user trying to add themselves as friends.
   *  - Non valid users are not added as friends.
   *  - If the user has already sent a friend request, or already friends.
   */
  @UseGuards(LoginGuard)
  @Put('/request')
  async acceptFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;
    // Check for valid users.
    const checkValidUser = async (uId: string) => this.userService.getUser(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      throw new HttpException(
        'Invalid user Ids provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const friended: boolean = await this.alreadyFriends(senderId, sendeeId);
    if (!friended && (await this.hasUserAsentReqToB(sendeeId, senderId))) {
      await Promise.all([
        this.friendService.addFriend(sendeeId, senderId),
        this.friendService.declineFriendRequest(senderId, sendeeId),
      ]);

      return {
        status: 'Successfully accepted friend request!',
        data: sendeeId,
      };
    }
    // Error handling response.
    let errorStatus = 'Failed to accept friend request! ';
    if (friended) {
      errorStatus += 'Already friends!';
    } else {
      errorStatus += 'No friend request sent by sendee to be accepted!';
    }

    throw new HttpException(
      {
        status: errorStatus,
        data: sendeeId,
      },
      HttpStatus.CONFLICT,
    );
  }

  /**
   * Decline a friend request from a valid user.
   * This would remove the friend requests (documents) from both users.
   *
   * [Defensively checked for]:
   *  - Non valid users.
   *
   */
  @UseGuards(LoginGuard)
  @Delete('/request')
  async deleteFriendRequest(@Body() body: FriendRequestDto) {
    const { senderId, sendeeId } = body;
    // Check for valid users.
    const checkValidUser = async (uId: string) => this.userService.getUser(uId);
    const sendee = checkValidUser(sendeeId);
    const sender = checkValidUser(senderId);
    // Validity checker for the user Ids provided.
    if (!sendee || !sender) {
      throw new HttpException(
        'Invalid user Ids provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'Successfully removed friend request!',
      data: {
        id: await this.friendService.declineFriendRequest(senderId, sendeeId),
      },
    };
  }
}
