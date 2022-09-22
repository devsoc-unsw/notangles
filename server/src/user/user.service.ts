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

  async createSettings(
    SettingsDto: UserSettingsDto,
    userID: string,
  ): Promise<Settings> {
    const setUserSettings = async () =>
      await this.userModel.findOneAndUpdate(
        { google_uid: userID },
        { $set: { settings: new this.settingsModel(SettingsDto) } },
      );
    return (await setUserSettings()).settings;
  }

  async getSettings(userID: string): Promise<Settings> {
    const user = await this.userModel.findOne({
      google_uid: userID,
    });
    return user.settings;
  }

  async getTimetables(userID: string): Promise<UserTimetablesDto[]> {
    return this.userModel
      .findOne({ google_uid: userID })
      .select('timetables')
      .exec()
      .then((r) => {
        return r.timetables;
      });
  }

  async createTimetable(
    timetableData: UserTimetablesDto,
    userID: string,
  ): Promise<UserTimetablesDto[]> {
    const uuid = require('uuid');
    const generatedId = uuid.v4();
    const timetable: TimetableDocument = new this.timetableModel({
      timetableId: generatedId,
      selectedClasses: timetableData.selectedClasses,
      selectedCourses: timetableData.selectedCourses,
      events: timetableData.events,
    });

    return this.userModel
      .findOneAndUpdate(
        { google_uid: userID },
        { $push: { timetables: new this.timetableModel(timetable) } },
      )
      .then((r) => r.timetables);
  }

  async deleteTimetable(
    userID: string,
    ttToDeleteId: string,
  ): Promise<UserTimetablesDto[]> {
    console.log('deleting timetable with id: ' + ttToDeleteId);
    return this.userModel
      .findOneAndUpdate(
        { google_uid: userID },
        { $pull: { timetables: { timetableId: ttToDeleteId } } },
        { safe: true, multi: false },
      )
      .then((r) => r.timetables);
  }

  async editTimetable(
    userID: string,
    edittedTimetable: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    return this.userModel
      .findOneAndUpdate(
        { google_uid: userID },
        { $set: { 'timetables.$[elem]': edittedTimetable } },
        {
          arrayFilters: [{ 'elem.timetableId': edittedTimetable.timetableId }],
        },
      )
      .then((r) => r.timetables);
  }

  /**
   * Find a user by their google_uid.
   * @param userID
   * @returns
   */
  async getUser(userID: string): Promise<User> {
    return this.userModel.findOne({ google_uid: userID });
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
    const trailingNamespace = name.slice(1, count).join(' ');

    return this.userModel.find({
      $and: [{ firstname: givenName }, { lastname: trailingNamespace }],
    });
  }

  async getAllUsers(): Promise<User> {
    return this.userModel.findOne({});
  }
}
