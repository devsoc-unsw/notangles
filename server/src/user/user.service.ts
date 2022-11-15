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
import { UserSettingsDto, UserTimetablesDto } from './dtos/user.dto';

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Injectable()
export class UserService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable')
    private timetableModel: Model<TimetableDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  /**
   * Change the user's settings data.
   */
  async createSettings(SettingsDto: UserSettingsDto, userID: string) {
    await this.userModel.findOneAndUpdate(
      { userId: userID },
      { $set: { settings: new this.settingsModel(SettingsDto) } },
    );

    return await this.getSettings(userID);
  }

  /**
   * Get the settings data of a user.
   */
  async getSettings(userId: string) {
    const user = await this.userModel.findOne({
      userId: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user.settings;
  }

  /**
   * Get all the timetables of a user.
   */
  async getTimetables(userId: string) {
    const user = await this.userModel.findOne({
      userId: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user.timetables;
  }

  /**
   * Create a timetable and put in the user's timetables.
   */
  async createTimetable(timetableData: UserTimetablesDto, userId: string) {
    const uuid = require('uuid');
    const generatedId = uuid.v4();
    const timetable: TimetableDocument = new this.timetableModel({
      timetableId: generatedId,
      selectedClasses: timetableData.selectedClasses,
      selectedCourses: timetableData.selectedCourses,
      events: timetableData.events,
    });

    const user = await this.userModel.findOne({
      userId: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);

    await this.userModel.findOneAndUpdate(
      { userId: userId },
      { $push: { timetables: new this.timetableModel(timetable) } },
    );

    return generatedId;
  }

  /**
   * Delete a particular timetable from a user's timetables.
   */
  async deleteTimetable(userId: string, ttToDeleteId: string) {
    const user = await this.userModel.findOne({
      userId: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    let foundTimetable: UserTimetablesDto;
    user.timetables.forEach((timetable) => {
      if (timetable.timetableId === ttToDeleteId) {
        foundTimetable = timetable;
      }
    });

    if (!foundTimetable)
      throw new HttpException('Timetable Not Found!', HttpStatus.NOT_FOUND);

    await this.userModel
      .findOneAndUpdate(
        { userId: userId },
        { $pull: { timetables: { timetableId: ttToDeleteId } } },
        { safe: true, multi: false },
      )
      .exec();

    return ttToDeleteId;
  }

  /**
   * Edit a given timetable.
   */
  async editTimetable(userId: string, editedTimetable: UserTimetablesDto) {
    const { timetableId: timetableToDelete } = editedTimetable;
    // Error handling - User Not Found
    const user = await this.userModel.findOne({
      userId: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    let foundTimetable: UserTimetablesDto;
    user.timetables.forEach((timetable) => {
      if (timetable.timetableId === editedTimetable.timetableId) {
        foundTimetable = timetable;
      }
    });

    if (!foundTimetable)
      throw new HttpException('Timetable Not Found!', HttpStatus.NOT_FOUND);
    await this.userModel
      .findOneAndUpdate(
        { userId: userId, 'timetables.timetableId': timetableToDelete },
        { $set: { 'timetables.$': editedTimetable } },
        { safe: true, multi: false },
      )
      .exec();

    return editedTimetable.timetableId;
  }

  /**
   * Checks if two users are already friendss
   */
  async isAlreadyFriends(userId: string, friendId: string) {
    const user = await this.getUserById(userId);
    return user.friends.includes(friendId);
  }

  /**
   * Find a user by their userId.
   */
  async getUserById(userId: string) {
    const user = await this.userModel.findOne({ userId: userId });
    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user;
  }

  /**
   * Find a user by their full name
   * If there are three or more words in the user's name:
   *  The first word is their first name by default.
   *  The second and consecutive words define their last name field.
   */
  async getUserByFullName(fullname: string) {
    const numSpaces: number = fullname.match(/_/g).length;
    const nameSplit = fullname.split('_');
    const given_name = nameSplit[0];
    const lastNames = nameSplit.slice(1, numSpaces + 1).join(' ');

    const users = await this.userModel.find({
      $and: [{ firstname: given_name }, { lastname: lastNames }],
    });

    if (!users || users.length === 0)
      throw new HttpException(
        'No user found with that name!',
        HttpStatus.NOT_FOUND,
      );

    return users;
  }
}
