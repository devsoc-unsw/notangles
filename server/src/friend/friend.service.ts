import {
  HttpException,
  HttpStatus,
  Injectable,
  SerializeOptions,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SettingsDocument,
  TimetableDocument,
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

  async getUser(userId: string) {
    const user: UserDocument = await this.userModel
      .findOne({ userId: userId })
      .exec();
    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user;
  }

  /**
   * Returns all friends of a valid user.
   */
  async getFriends(userId: string) {
    const user = await this.getUser(userId);
    return await this.userModel.find({ userId: user.friends }).exec();
  }

  /**
   * Adds a friend to a user's friend list.
   */
  async addFriend(userId: string, friendId: string) {
    if (userId === friendId) return friendId;

    const [_user, _friend] = await Promise.all([
      this.getUser(userId),
      this.getUser(friendId),
    ]);

    const addFriendToUser = async (uId: string, fId: string) => {
      await this.userModel
        .findOneAndUpdate({ userId: uId }, { $addToSet: { friends: fId } })
        .exec();
    };

    await addFriendToUser(userId, friendId);
    await addFriendToUser(friendId, userId);

    return friendId;
  }

  /**
   * Forcefully remove a friend from a user's friend list in a
   * bidirectional manner.
   */
  async removeFriend(userId: string, friendId: string) {
    const removeFriendFromUser = async (uId: string, fId: string) => {
      const [_user, _friend] = await Promise.all([
        this.getUser(userId),
        this.getUser(friendId),
      ]);

      await this.userModel
        .findOneAndUpdate({ userId: uId }, { $pull: { friends: fId } })
        .exec();
    };

    await Promise.all([
      removeFriendFromUser(userId, friendId),
      removeFriendFromUser(friendId, userId),
    ]);

    return friendId;
  }

  /**
   * Get a user's sent friend requests
   */
  async getSentFriendRequests(userId: string) {
    const user: FriendRequestDocument = await this.friendRequestModel
      .findOne({ userId })
      .exec();

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);

    return await this.userModel.find({ userId: user.sentRequestsTo }).exec();
  }

  /**
   * Get a user's incoming friend requests
   */
  async getRecvFriendRequests(userId: string) {
    const user: FriendRequestDocument = await this.friendRequestModel
      .findOne({ userId })
      .exec();

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);

    const recvFriendRequests = await this.friendRequestModel.find({
      sentRequestsTo: userId,
    });

    return await this.userModel.find({
      userId: recvFriendRequests.map((req) => req.userId),
    });
  }

  /**
   * Forcefully adds a friend to a user's friend list.
   */
  async sendFriendRequest(userId: string, friendId: string) {
    if (userId === friendId) return friendId;

    await this.friendRequestModel
      .findOneAndUpdate(
        { userId: userId },
        { $addToSet: { sentRequestsTo: friendId } },
      )
      .exec();

    return friendId;
  }

  /**
   * Decline user's friend request. This will remove the friend request
   * bidirectionally.
   */
  async declineFriendRequest(userId: string, friendId: string) {
    const senderRequests = await this.friendRequestModel
      .findOne({ userId: userId })
      .exec();

    if (!senderRequests.sentRequestsTo.includes(friendId)) {
      throw new HttpException(
        "Friend request doesn't exist!",
        HttpStatus.NOT_FOUND,
      );
    }

    const pullFriendIdFromUser = async (uId: string, fId: string) => {
      await this.friendRequestModel
        .findOneAndUpdate({ userId: uId }, { $pull: { sentRequestsTo: fId } })
        .exec();
    };

    await Promise.all([
      pullFriendIdFromUser(userId, friendId),
      pullFriendIdFromUser(friendId, userId),
    ]);

    return friendId;
  }
}
