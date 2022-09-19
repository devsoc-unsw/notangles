import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInterface } from '../schemas/user.schema';

@Injectable({})
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}
  
  // return the user's profile from a given uid
  async getProfile(uidGiven: string) {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length !== 0 ? response.at(0) : null;
  }

  // return the user's timetable from a given uid
  async getTimetable(uidGiven: string) {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length !== 0 ? response.at(0) : null;

}
