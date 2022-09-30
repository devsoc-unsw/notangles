import {
  HttpException,
  HttpStatus,
  Injectable,
  SerializeOptions,
} from '@nestjs/common';
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

  async getUser(userId: string): Promise<User> {
    const user: UserDocument = await this.userModel
      .findOne({ google_uid: userId })
      .exec();
    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user;
  }

  /**
   * Returns all friends of a valid user.
   * @param userID: string which represents the user's google_uid.
   * @returns Promise of an array of users who are the friends of the user.
   */
  async getFriends(userId: string): Promise<User[]> {
    const user = await this.getUser(userId);
    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
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
  async addFriend(userId: string, friendId: string): Promise<string> {
    if (userId !== friendId) {
      // Defensively checking if either exist.
      const [_user, _friend] = await Promise.all([
        this.getUser(userId),
        this.getUser(friendId),
      ]);

      const pushFriendIdToUser = async (uId: string, fId: string) => {
        await this.userModel
          .findOneAndUpdate(
            { google_uid: uId },
            { $addToSet: { friends: fId } },
          )
          .exec();
      };
      await pushFriendIdToUser(userId, friendId);
      await pushFriendIdToUser(friendId, userId);
    }
    return friendId;
  }

  /**
   * Forcefully remove a friend from a user's friend list in a
   * bidirectional manner.
   * @param userId: string which represents the user's google_uid.
   * @param friendId: string which represents the friend's google_uid.
   * @returns Promise of an array of users who are the friends of the user.
   */
  async removeFriend(userId: string, friendId: string): Promise<string> {
    const removeFriendIdFromUser = async (uId: string, fId: string) => {
      // Defensively checking if either exist.
      const [_user, _friend] = await Promise.all([
        this.getUser(userId),
        this.getUser(friendId),
      ]);

      await this.userModel
        .findOneAndUpdate({ google_uid: uId }, { $pull: { friends: fId } })
        .exec();
    };

    await Promise.all([
      removeFriendIdFromUser(userId, friendId),
      removeFriendIdFromUser(friendId, userId),
    ]);

    return friendId;
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
    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
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
  async sendFriendRequest(userId: string, friendId: string): Promise<string> {
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
    return friendId;
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
  ): Promise<string> {
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

    return friendId;
  }
}
