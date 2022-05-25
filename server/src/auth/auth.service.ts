import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { user, userDocument, userInterface } from './schemas/user.schema';

/**
 * TODO: Implement the logic for finding users in the database by their user ID here.
 */

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<userDocument>) {}

  async createUser(userInfo: any): Promise<void> {
    // check if user already exists
    let isCurrentUser = await this.getUser(userInfo.sub);
    // adding user if user doesn't exists
    if (!isCurrentUser) {
      let newUser = {
        google_uid: userInfo.sub,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const userAdded = new this.userModel(newUser);
      userAdded.save();
    }
  }

  async getUser(uidGiven: string): Promise<boolean> {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length === 0;
  }
}
