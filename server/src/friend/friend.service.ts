import { Injectable, SerializeOptions } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Settings,
  SettingsDocument,
  Timetable,
  TimetableDocument,
  User,
  UserDocument,
} from '../schemas/user.schema';
import { FriendRequestDocument } from './dtos/friend.dto';

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Injectable()
export class FriendService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable')
    private timetableModel: Model<TimetableDocument>,
    @InjectModel('FriendRequest')
    private friendRequestModel: Model<FriendRequestDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  /**
   * Returns all friends of a valid user.
   * @param userID: string which represents the user's google_uid.
   * @returns Promise of an array of users who are the friends of the user.
   */
  async getFriends(userID: string): Promise<User[]> {
    const user: UserDocument = await this.userModel
      .findOne({ google_uid: userID })
      .exec();
    const friends: User[] = [];
    // Safety checks for the case where the user is non existent.
    if (!user) return friends;
    for (const f of user.friends) {
      const friendFound: UserDocument = await this.userModel
        .findOne({ google_uid: f })
        .exec();
      friends.push(friendFound);
    }
    return friends;
  }

  /**
   * Forcefully adds a friend to a user's friend list.
   * @param userId: string which represents the user's google_uid.
   * @param friendId: string which represents the friend's google_uid.
   * @returns Promise of an array of users who are the friends of the user.
   */
  async addFriend(userId: string, friendId: string): Promise<User[]> {
    if (userId !== friendId) {
      const pushFriendIdToUser = async (uId: string, fId: string) => {
        await this.userModel
          .findOneAndUpdate(
            { google_uid: uId },
            { $addToSet: { friends: fId } },
          )
          .exec();
      };
      console.log(await pushFriendIdToUser(userId, friendId));
      await pushFriendIdToUser(userId, friendId);
      await pushFriendIdToUser(friendId, userId);
    }
    return await this.getFriends(userId);
  }

  /**
   * Forcefully remove a friend from a user's friend list in a
   * bidirectional manner.
   * @param userId: string which represents the user's google_uid.
   * @param friendId: string which represents the friend's google_uid.
   * @returns Promise of an array of users who are the friends of the user.
   */
  async removeFriend(userId: string, friendId: string): Promise<User[]> {
    const removeFriendIdFromUser = async (uId: string, fId: string) => {
      await this.userModel
        .findOneAndUpdate({ google_uid: uId }, { $pull: { friends: fId } })
        .exec();
    };

    await Promise.all([
      removeFriendIdFromUser(userId, friendId),
      removeFriendIdFromUser(friendId, userId),
    ]);

    return await this.getFriends(userId);
  }

  /**
   * Get the friend requests of a user from the FriendRequest collection.
   *
   * @param userId: string which represents the user's google_uid.
   * @returns Promise of an array of users who are currently in
   *          a user's friend request collection.
   */
  async getFriendRequests(userId: string): Promise<User[]> {
    const user: FriendRequestDocument = await this.friendRequestModel
      .findOne({ google_uid: userId })
      .exec();
    const friendRequestsSentTo: User[] = [];

    for (const f of user.sentRequestsTo) {
      const potentialFriendRequest: UserDocument = await this.userModel
        .findOne({ google_uid: f })
        .exec();
      friendRequestsSentTo.push(potentialFriendRequest);
    }
    return friendRequestsSentTo;
  }

  /**
   * Forcefully adds a friend to a user's friend list.
   * @param userId: string which represents the user's google_uid.
   * @param friendId: string which represents the friend's google_uid.
   * @returns Promise of an array of users who are currently in
   *          a user's friend request collection.
   */
  async sendFriendRequest(userId: string, friendId: string): Promise<User[]> {
    if (userId !== friendId) {
      const pushFriendIdToUser = async (uId: string, fId: string) => {
        await this.friendRequestModel
          .findOneAndUpdate(
            { google_uid: uId },
            { $addToSet: { sentRequestsTo: fId } },
          )
          .exec();
      };

      await pushFriendIdToUser(userId, friendId);
    }
    return await this.getFriendRequests(userId);
  }

  /**
   * Decline user's friend request. This will remove the friend request
   * bidirectionally.
   * @param userId: string which represents the user's google_uid.
   * @param friendId: string which represents the friend's google_uid.
   * @returns Promise of an array of users who are currently in
   *          a user's friend request collection.
   */
  async declineFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<User[]> {
    const pullFriendIdFromUser = async (uId: string, fId: string) => {
      await this.friendRequestModel
        .findOneAndUpdate(
          { google_uid: uId },
          { $pull: { sentRequestsTo: fId } },
        )
        .exec();
    };

    await pullFriendIdFromUser(userId, friendId);
    await pullFriendIdFromUser(friendId, userId);

    return await this.getFriendRequests(userId);
  }

  /**
   *
   * @returns REMOVE THIS
   */
  async dropFriendRequests(): Promise<User[]> {
    await this.friendRequestModel.deleteMany({}).exec();
    return [];
  }
}
