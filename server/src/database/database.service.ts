import { Model } from 'mongoose';
import { Get, Injectable, SerializeOptions } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserSettingsDto, UserTimetableDataDto } from './dtos/database.dto';
import {
  Settings,
  SettingsDocument,
  Timetable,
  TimetableDocument,
} from './schemas';
import { User, UserDocument } from 'src/auth/schemas/user.schema';

@SerializeOptions({
    excludePrefixes: ['_'],
  })
@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable') private timetableModel: Model<TimetableDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>
  ) {}

  async createSettings(SettingsDto: UserSettingsDto, userID: string): Promise<Settings> {
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { settings: new this.settingsModel(SettingsDto) } },
    );

    // const createdSettings = new this.settingsModel(SettingsDto);
    // return createdSettings.save();
  }

  async getSettings(userID: string): Promise<Settings> {
    return this.userModel
      .findOne({ google_uid: userID })
      .select('settings')
      .exec()
      .then((r) => r.settings);
  }

  async getTimetable(userID: string): Promise<Timetable> {
    return this.userModel
      .findOne({ google_uid: userID })
      .select('timetable')
      .exec()
      .then((r) => r.timetable);
  }

  async createTimetable(timetableData: UserTimetableDataDto, userID: string): Promise<Timetable> {
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { timetable: new this.timetableModel(timetableData) } },
    );
  }
}
