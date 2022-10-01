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
  TimetableDocument,
  User,
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
  async createSettings(
    SettingsDto: UserSettingsDto,
    userID: string,
  ): Promise<Settings> {
    await this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { settings: new this.settingsModel(SettingsDto) } },
    );

    const updatedSettings = await this.getSettings(userID);
    return updatedSettings;
  }

  /**
   * Get the settings data of a user.
   */
  async getSettings(userId: string): Promise<Settings> {
    const user = await this.userModel.findOne({
      google_uid: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user.settings;
  }

  /**
   * Get all the timetables of a user.
   */
  async getTimetables(userId: string): Promise<UserTimetablesDto[]> {
    const user = await this.userModel.findOne({
      google_uid: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user.timetables;
  }

  /**
   * Create a timetable and put in the user's timetables.
   */
  async createTimetable(
    timetableData: UserTimetablesDto,
    userId: string,
  ): Promise<string> {
    const uuid = require('uuid');
    const generatedId = uuid.v4();
    const timetable: TimetableDocument = new this.timetableModel({
      timetableId: generatedId,
      selectedClasses: timetableData.selectedClasses,
      selectedCourses: timetableData.selectedCourses,
      events: timetableData.events,
    });

    const user = await this.userModel.findOne({
      google_uid: userId,
    });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);

    await this.userModel.findOneAndUpdate(
      { google_uid: userId },
      { $push: { timetables: new this.timetableModel(timetable) } },
    );

    return generatedId;
  }

  /**
   * Delete a particular timetable from a user's timetables.
   */
  async deleteTimetable(userId: string, ttToDeleteId: string): Promise<string> {
    const user = await this.userModel.findOne({
      google_uid: userId,
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
        { google_uid: userId },
        { $pull: { timetables: { timetableId: ttToDeleteId } } },
        { safe: true, multi: false },
      )
      .exec();

    return ttToDeleteId;
  }

  /**
   * Edit a given timetable.
   */
  async editTimetable(
    userId: string,
    editedTimetable: UserTimetablesDto,
  ): Promise<string> {
    const { timetableId: timetableToDelete } = editedTimetable;
    // Error handling - User Not Found
    const user = await this.userModel.findOne({
      google_uid: userId,
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
        { google_uid: userId, 'timetables.timetableId': timetableToDelete },
        { $set: { 'timetables.$': editedTimetable } },
        { safe: true, multi: false },
      )
      .exec();

    return editedTimetable.timetableId;
  }

  /**
   * Find a user by their google_uid.
   */

  async getUser(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ google_uid: userId });

    if (!user) throw new HttpException('User Not Found!', HttpStatus.NOT_FOUND);
    return user;
  }

  /**
   * Get a user's first and last name from the parameter.
   * Note: The parameter is CASE SENSITIVE and is of form: "Firstname_Lastname"
   * For example: "John_Doe"
   *
   * Three or more words in name case:
   *  When a user have three words (or more) with their name,
   *  the first word is their firstname by default.
   *  The second and consecutive words define their lastname field.
   * @param userFullName
   * @returns
   */
  async getUserByFullName(userFullName: string): Promise<Promise<User[]>> {
    const count: number = userFullName.match(/_/g).length;
    const name = userFullName.split('_');
    const givenName = name[0];
    const trailingNamespace = name.slice(1, count + 1).join(' ');
    const user = await this.userModel.find({
      $and: [{ firstname: givenName }, { lastname: trailingNamespace }],
    });

    if (!user || user.length === 0)
      throw new HttpException(
        'No user found with that name!',
        HttpStatus.NOT_FOUND,
      );
    return user;
  }

  /**
   * [Utility]
   * Get all the users in the database.
   * @returns a Promise of all the users in the database.
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find({});
  }
}
