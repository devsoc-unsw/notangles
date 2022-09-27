import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/schemas/user.schema';
import { FriendService } from './friend.service';
import { UserService } from 'src/user/user.service';
import { FriendRequestDto } from './dtos/friend.dto';
import { LoginGuard } from 'src/auth/login.guard';

@Controller('friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService,
  ) {}

  /**
   * Return all already added friends for a user.
   *
   * [Defensively checked for]:
   *  - If the user is not found.
   *
   * @param req: the Request route handler param.
   * @returns Promise to an array of users who are the users friend.
   */
  @UseGuards(LoginGuard)
  @Get('/:userId')
  async getFriends(@Request() req): Promise<User[]> {
    if (req.params.userId) {
      return await this.friendService.getFriends(req.params.userId);
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
   * @param body decorator of the form FriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @UseGuards(LoginGuard)
  @Post('/')
  async addFriend(@Body() body: FriendRequestDto): Promise<User[]> {
    const { senderId, sendeeId } = body;
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      return [];
    }
    return await this.friendService.addFriend(senderId, sendeeId);
  }

  /**
   * Forcefully remove two valid users from being friends.
   * Bidirectional removal of friendship relation.
   * [Defensively checked for]:
   *  - Non valid users.
   *
   * @param body decorator of the form FriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @UseGuards(LoginGuard)
  @Delete('/')
  async deleteFriend(@Body() body: FriendRequestDto): Promise<User[]> {
    const { senderId, sendeeId } = body;
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      return [];
    }
    return await this.friendService.removeFriend(senderId, sendeeId);
  }

  /**
   * Send a friend request to a valid user.
   * [Defensively checked for]:
   *  - The user trying to add themselves as friends.
   *  - Non valid users are not added as friends.
   *  - If the user has already sent a friend request, or already friends.
   *
   * @param body decorator of the form FriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @UseGuards(LoginGuard)
  @Post('/request')
  async sendFriendRequest(@Body() body: FriendRequestDto): Promise<User[]> {
    const { senderId, sendeeId } = body;
    // Check for valid users.
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      return [];
    }

    const hasUserAsentReqToB = async (
      uId: string,
      fId: string,
    ): Promise<boolean> => {
      const getUserFriendReqs: User[] =
        await this.friendService.getFriendRequests(uId);

      for (const u of getUserFriendReqs) {
        if (u.google_uid === fId) {
          return true;
        }
      }
      return false;
    };

    const alreadyFriends = async (
      uId: string,
      fId: string,
    ): Promise<boolean> => {
      const user: User = await this.userService.getUser(uId);
      // Check if they are already friends or not.
      if (user.friends.includes(fId)) {
        return true;
      }
      return false;
    };

    const friended: boolean = await alreadyFriends(senderId, sendeeId);
    if (!friended) {
      let [recv, sent]: [boolean, boolean] = await Promise.all([
        hasUserAsentReqToB(senderId, sendeeId),
        hasUserAsentReqToB(sendeeId, senderId),
      ]);

      if (recv && sent) {
        // Add them as friends, and concurrently clean up the friend requests collection.
        await Promise.all([
          this.friendService.addFriend(sendeeId, senderId),
          this.friendService.declineFriendRequest(senderId, sendeeId),
        ]);
      } else {
        // One person or neither has not sent a friend Request to the other.
        return await this.friendService.sendFriendRequest(senderId, sendeeId);
      }
    }

    return await this.friendService.getFriendRequests(senderId);
  }

  /**
   * Decline a friend request from a valid user.
   * This would remove the friend requests (documents) from both users.
   *
   * [Defensively checked for]:
   *  - Non valid users.
   *
   * @param body decorator of the form FriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @UseGuards(LoginGuard)
  @Delete('/request')
  async deleteFriendRequest(@Body() body: FriendRequestDto): Promise<User[]> {
    const { senderId, sendeeId } = body;
    // Check for valid users.
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(senderId) || !checkValidUser(sendeeId)) {
      return [];
    }

    return await this.friendService.declineFriendRequest(senderId, sendeeId);
  }
}
