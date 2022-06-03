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
import { UserDocument } from 'src/auth/schemas/user.schema';

@SerializeOptions({
    excludePrefixes: ['_'],
  })
@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable') private timetabelModel: Model<TimetableDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>
  ) {}

  async createSettings(SettingsDto: UserSettingsDto): Promise<Settings> {
    const userID = 'some-user-id';
    return this.userModel.findOneAndUpdate(
      { google_uid: userID },
      { $set: { settings: new this.settingsModel(SettingsDto) } },
    );

    const createdSettings = new this.settingsModel(SettingsDto);
    return createdSettings.save();
  }

  async getSettings(userID: string): Promise<Settings> {
    return this.settingsModel
      .findOne({
        userID,
      })
      .exec();
  }

  async getTimetable(userID: string): Promise<Timetable> {
    return this.timetabelModel.findOne({ userID }).exec();
  }

  async createTimetable(timetableData: UserTimetableDataDto): Promise<Timetable> {
    const createdTimetable = new this.timetabelModel(timetableData);
    return createdTimetable.save();
  }
}
