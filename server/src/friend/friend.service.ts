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

@SerializeOptions({
  excludePrefixes: ['_'],
})
@Injectable()
export class FriendService {
  constructor(
    @InjectModel('UserSettings') private settingsModel: Model<SettingsDocument>,
    @InjectModel('UserTimetable')
    private timetableModel: Model<TimetableDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}
}
