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
import { UserSettingsDto, UserTimetablesDto } from './dtos/database.dto';

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Injectable()
export class DatabaseService {
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
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { settings: new this.settingsModel(SettingsDto) } },
    );
  }

  async getSettings(userID: string): Promise<Settings> {
    return this.userModel
      .findOne({ google_uid: userID })
      .select('settings')
      .exec()
      .then((r) => r.settings);
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
    const timetable = new this.timetableModel({
      timetableId: generatedId,
      selectedClasses: timetableData.selectedClasses,
      selectedCourses: timetableData.selectedCourses,
      events: timetableData.events,
    });

    // console.log(timetable);
    // console.log('TEST');
    // console.log(timetableData.events);
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $push: { timetables: new this.timetableModel(timetable) } },
    );
  }

  async deleteTimetable(
    userID: string,
    ttToDeleteId: string,
  ): Promise<UserTimetablesDto[]> {
    console.log('deleting timetable with id: ' + ttToDeleteId);
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $pull: { timetables: { timetableId: ttToDeleteId } } },
      { safe: true, multi: false },
    );
  }

  async editTimetable(
    userID: string,
    edittedTimetable: UserTimetablesDto,
  ): Promise<UserTimetablesDto[]> {
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { 'timetables.$[elem]': edittedTimetable } },
      {
        arrayFilters: [{ 'elem.timetableId': edittedTimetable.timetableId }],
      },
    );
  }

  async getUser(userID: string): Promise<User> {
    // console.log(userID as string);
    // this.userModel.find({}).then((e) => console.log(e));
    return this.userModel.findOne({ google_uid: userID });
  }

  async getUserByFullName(userFullName: string): Promise<Promise<User>[]> {
    // userFullName is in the format of "firstname_lastname"
    // Case sensitve search: The first and last characters are capitalised.
    // TODO: store the first name and last name as lower case?
    // so searching is more efficient and we do not have to handle weird edge cases later.
    return this.userModel.find({
      $and: [
        { firstname: userFullName.split('_')[0] },
        { lastname: userFullName.split('_')[1] },
      ],
    });
  }

  async getAllUsers(): Promise<User> {
    return this.userModel.findOne({});
  }
}
