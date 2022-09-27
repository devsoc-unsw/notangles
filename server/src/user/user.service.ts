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
   *
   * Please see the documentation for the Dto for more information.
   * @param SettingsDto: UserSettingsDto - The settings data to be changed.
   * @param userID: string of the user's google_uid.
   * @returns a Promise of the updated settings data.
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
   * @param userID: string of the user's google_uid.
   * @returns a Promise of the settings data.
   */
  async getSettings(userID: string): Promise<Settings> {
    const user = await this.userModel.findOne({
      google_uid: userID,
    });
    return user.settings;
  }

  /**
   * Get all the timetables of a user.
   * @param userID: string of the user's google_uid.
   * @returns a Promise of the user's timetables.
   */
  async getTimetables(userID: string): Promise<UserTimetablesDto[]> {
    const timetables = await this.userModel
      .findOne({ google_uid: userID })
      .select('timetables')
      .exec();
    return timetables.timetables;
  }

  /**
   * Create a timetable and put in the user's timetables.
   * @param timetableData: in UserTimetablesDto format, please check documentation
   *                       for more information.
   * @param userId: string of the user's google_uid.
   * @returns a Promise of the updated timetables.
   */
  async createTimetable(
    timetableData: UserTimetablesDto,
    userId: string,
  ): Promise<UserTimetablesDto[]> {
    const uuid = require('uuid');
    const generatedId = uuid.v4();
    const timetable: TimetableDocument = new this.timetableModel({
      timetableId: generatedId,
      selectedClasses: timetableData.selectedClasses,
      selectedCourses: timetableData.selectedCourses,
      events: timetableData.events,
    });

    await this.userModel.findOneAndUpdate(
      { google_uid: userId },
      { $push: { timetables: new this.timetableModel(timetable) } },
    );

    return await this.getTimetables(userId);
  }

  /**
   * Delete a particular timetable from a user's timetables.
   * @param userId: string of the user's google_uid.
   * @param ttToDeleteId: the timetableId of the timetable to be deleted.
   * @returns a Promise of the updated timetables.
   */
  async deleteTimetable(
    userId: string,
    ttToDeleteId: string,
  ): Promise<UserTimetablesDto[]> {
    await this.userModel
      .findOneAndUpdate(
        { google_uid: userId },
        { $pull: { timetables: { timetableId: ttToDeleteId } } },
        { safe: true, multi: false },
      )
      .exec();
    return await this.getTimetables(userId);
  }

  /**
   * Edit a given timetable.
   * @param userId: string of the user's google_uid.
   * @param editedTimetable: the timetable to be editted.
   * @returns a Promise of the updated timetables.
   */
  async editTimetable(
    userId: string,
    editedTimetable: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    const { timetableId: timetableToDelete } = editedTimetable;
    await this.userModel
      .findOneAndUpdate(
        { google_uid: userId, 'timetables.timetableId': timetableToDelete },
        { $set: { 'timetables.$': editedTimetable } },
        { safe: true, multi: false },
      )
      .exec();

    return await this.getTimetables(userId);
  }

  /**
   * Find a user by their google_uid.
   * @param userId - the google_uid of the user.
   * @returns a Promise of the user.
   */
  async getUser(userId: string): Promise<User> {
    return await this.userModel.findOne({ google_uid: userId });
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
  async getUserByFullName(userFullName: string): Promise<Promise<User>[]> {
    const count: number = userFullName.match(/_/g).length;
    const name = userFullName.split('_');
    const givenName = name[0];
    const trailingNamespace = name.slice(1, count + 1).join(' ');
    return await this.userModel.find({
      $and: [{ firstname: givenName }, { lastname: trailingNamespace }],
    });
  }

  /**
   * [Utility]
   * Get all the users in the database.
   * @returns a Promise of all the users in the database.
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find({});
  }

  /**
   * [Utility]
   * Validity checker if a user exists or not
   * @param userId
   * @returns
   */
  async checkIfUserExists(userId: string): Promise<boolean> {
    const user: UserDocument = await this.userModel
      .findOne({ google_uid: userId })
      .exec();
    return user !== null;
  }
}
