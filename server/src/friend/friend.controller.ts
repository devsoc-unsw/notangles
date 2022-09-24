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
import { SingleFriendRequestDto } from './dtos/friend.dto';
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
  @Get('/:userId')
  @UseGuards(LoginGuard)
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
   * @param body decorator of the form SingleFriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @Post('/')
  @UseGuards(LoginGuard)
  async addFriend(@Body() body: SingleFriendRequestDto): Promise<User[]> {
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(body.userId) || !checkValidUser(body.friendId)) {
      return [];
    }
    return await this.friendService.addFriend(body.userId, body.friendId);
  }

  /**
   * Forcefully remove two valid users from being friends.
   * Bidirectional removal of friendship relation.
   * [Defensively checked for]:
   *  - Non valid users.
   *
   * @param body decorator of the form SingleFriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @Delete('/')
  @UseGuards(LoginGuard)
  async deleteFriend(@Body() body: SingleFriendRequestDto): Promise<User[]> {
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(body.userId) || !checkValidUser(body.friendId)) {
      return [];
    }
    return await this.friendService.removeFriend(body.userId, body.friendId);
  }

  /**
   * Send a friend request to a valid user.
   * [Defensively checked for]:
   *  - The user trying to add themselves as friends.
   *  - Non valid users are not added as friends.
   *  - If the user has already sent a friend request, or already friends.
   *
   * @param body decorator of the form SingleFriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @Post('/request')
  @UseGuards(LoginGuard)
  async sendFriendRequest(
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    // Check for valid users.
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(body.userId) || !checkValidUser(body.friendId)) {
      return [];
    }

    // Initially, a check is made to see
    // if the user has already sent a friend request to the other user and viceversa
    // So we can add them as friends.

    const hasUserAsentReqToB = async (
      uId: string,
      fId: string,
    ): Promise<boolean> => {
      // After getting the user's friend requests, we check if the
      // intended friendId is in the requests array. If it is, we
      // set the return type as true.

      const getUserFriendReqs: User[] =
        await this.friendService.getFriendRequests(uId);

      for (const u of getUserFriendReqs) {
        if (u.google_uid === fId) {
          return true;
        }
      }
      return false;
    };

    /**
     * There could be the case that the users are already
     * friends, so we check for that too.
     * @param uId
     * @param fId
     * @returns
     */
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

    /**
     * Performance optimisation:
     * check before the promise all for the condition that
     * they are already friends or not to save some time
     */
    const friended: boolean = await alreadyFriends(body.userId, body.friendId);
    if (!friended) {
      let [recv, sent]: [boolean, boolean] = await Promise.all([
        hasUserAsentReqToB(body.userId, body.friendId),
        hasUserAsentReqToB(body.friendId, body.userId),
      ]);

      if (recv && sent) {
        // Add them as friends, and concurrently clean up the friend requests collection.
        await Promise.all([
          this.friendService.addFriend(body.friendId, body.userId),
          this.friendService.declineFriendRequest(body.userId, body.friendId),
        ]);
      } else {
        // One person or neither has not sent a friend Request to the other.
        await this.friendService.sendFriendRequest(body.userId, body.friendId);
      }
    }

    return await this.friendService.getFriendRequests(body.userId);
  }

  /**
   * Decline a friend request from a valid user.
   * This would remove the friend requests (documents) from both users.
   *
   * [Defensively checked for]:
   *  - Non valid users.
   *
   * @param body decorator of the form SingleFriendRequestDto. Please see
   *        confluence documentation for the interface structure.
   * @returns Promise to an array of users who are the users friend.
   */
  @Delete('/request')
  @UseGuards(LoginGuard)
  async deleteFriendRequest(
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    // Check for valid users.
    const checkValidUser = async (uId: string) =>
      this.userService.checkIfUserExists(uId);
    // Validity checker for the user Ids provided.
    if (!checkValidUser(body.userId) || !checkValidUser(body.friendId)) {
      return [];
    }
    await this.friendService.declineFriendRequest(body.friendId, body.userId);
    return await this.friendService.getFriendRequests(body.userId);
  }

  // REMOVE THIS
  @Delete('/requests')
  @UseGuards(LoginGuard)
  async deleteFriendRequests(
    @Body() body: SingleFriendRequestDto,
  ): Promise<User[]> {
    console.log('DELETING ALL REQUESTS');
    await this.friendService.dropFriendRequests();
    return [];
  }
}
