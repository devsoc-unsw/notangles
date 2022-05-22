import { Model } from 'mongoose';
import { Get, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserSettingsDto, UserTimetableDataDto } from './dtos/database.dto';
import {
  Settings,
  SettingsDocument,
  Timetable,
  TimetableDocument,
} from './schemas';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable')
    private timetabelModel: Model<TimetableDocument>,
  ) {}

  async createSettings(SettingsDto: UserSettingsDto): Promise<Settings> {
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
