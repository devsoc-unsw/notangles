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

  async getFriends(userID: string): Promise<User[]> {
    let fetchedFriends: User[] = [];
    return this.userModel
      .findOne({ google_uid: userID })
      .exec()
      .then((r) => {
        console.log(r);
        if (r.friends.length === 0) {
          return fetchedFriends;
        }

        r.friends.forEach((friend) => {
          this.userModel
            .findOne({ google_uid: friend })
            .exec()
            .then((r) => {
              fetchedFriends.push(r);
            })
            .then(() => {
              console.log(fetchedFriends);
              return fetchedFriends;
            });
        });
      });
  }

  async addFriend(userId: string, friendId: string): Promise<User[] | void> {
    return this.userModel
      .findOneAndUpdate(
        { google_uid: userId },
        { $push: { friends: friendId } },
      )
      .exec()
      .then(() => {
        this.userModel
          .findOneAndUpdate(
            { google_uid: friendId },
            { $push: { friends: userId } },
          )
          .exec()
          .then(() => {
            return this.getFriends(userId);
          });
      });
  }

  async removeFriend(userID: string, friendId): Promise<User[] | void> {
    return this.userModel
      .findOneAndUpdate({ google_uid: userID }, { $pop: { friends: friendId } })
      .exec()
      .then(() => {
        this.userModel
          .findOneAndUpdate(
            { google_uid: friendId },
            { $pop: { friends: userID } },
          )
          .exec()
          .then(() => {
            return this.getFriends(userID);
          });
      });
  }

  async getFriendRequests(userID: string): Promise<User[] | void> {
    const friendRequests: User[] = [];
    this.friendRequestModel
      .findOne({ google_uid: userID })
      .exec()
      .then((r) => {
        r.sentRequestsTo.forEach((friend) => {
          this.userModel
            .findOne({ google_uid: friend })
            .exec()
            .then((r) => {
              friendRequests.push(r);
            });
        });
      });

    return friendRequests;
  }

  async sendFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<User[] | void> {
    return this.userModel
      .findOneAndUpdate(
        { google_uid: userId },
        { $addToSet: { friends: friendId } },
      )
      .exec()
      .then(() => {
        this.userModel
          .findOneAndUpdate(
            { google_uid: friendId },
            { $addToSet: { friends: userId } },
          )
          .exec()
          .then(() => {
            return this.getFriends(userId);
          });
      });
  }

  async declineFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<User[] | void> {
    return this.friendRequestModel
      .findOneAndUpdate({ google_uid: userId }, { $pop: { friends: friendId } })
      .exec()
      .then(() => {
        this.friendRequestModel
          .findOneAndUpdate(
            { google_uid: friendId },
            { $pull: { friends: { $in: userId } } },
          )
          .exec()
          .then(() => {
            return this.getFriends(userId);
          });
      });
  }
}
