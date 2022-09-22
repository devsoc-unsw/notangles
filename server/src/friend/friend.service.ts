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
   *
   * @param userID
   * @returns
   */
  async getFriends(userID: string): Promise<User[]> {
    const user: UserDocument = await this.userModel
      .findOne({ google_uid: userID })
      .exec();
    const friends: User[] = [];
    user.friends.forEach(async (f) => {
      const friendFound: UserDocument = await this.userModel
        .findOne({ google_uid: f })
        .exec();
      friends.push(friendFound);
    });

    return friends;
  }

  async addFriend(userId: string, friendId: string): Promise<User[]> {
    const pushFriendIdToUser = async (uId: string, fId: string) => {
      await this.userModel
        .findOneAndUpdate({ google_uid: uId }, { $addToSet: { friends: fId } })
        .exec();
    };
    pushFriendIdToUser(userId, friendId);
    pushFriendIdToUser(friendId, userId);
    return await this.getFriends(userId);
  }

  async removeFriend(userId: string, friendId: string): Promise<User[]> {
    const removeFriendIdFromUser = async (uId: string, fId: string) => {
      await this.userModel
        .findOneAndUpdate({ google_uid: uId }, { $pop: { friends: fId } })
        .exec();
    };

    removeFriendIdFromUser(userId, friendId);
    removeFriendIdFromUser(friendId, userId);

    return await this.getFriends(userId);
  }

  async getFriendRequests(userID: string): Promise<User[]> {
    const user: FriendRequestDocument = await this.friendRequestModel
      .findOne({ google_uid: userID })
      .exec();
    const friends: User[] = [];
    user.sentRequestsTo.forEach(async (f) => {
      const friendFound: UserDocument = await this.userModel
        .findOne({ google_uid: f })
        .exec();
      friends.push(friendFound);
    });

    return friends;
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<User[]> {
    const pushFriendIdToUser = async (uId: string, fId: string) => {
      await this.friendRequestModel
        .findOneAndUpdate(
          { google_uid: uId },
          { $addToSet: { sentRequestsTo: fId } },
        )
        .exec();
    };

    pushFriendIdToUser(userId, friendId);
    pushFriendIdToUser(friendId, userId);

    return await this.getFriends(userId);
  }

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

    pullFriendIdFromUser(userId, friendId);
    pullFriendIdFromUser(friendId, userId);

    return await this.getFriendRequests(userId);
  }
}
