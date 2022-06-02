import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInterface } from './schemas/user.schema';

/**
 * TODO: Implement the logic for finding users in the database by their user ID here.
 */

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async createUser(userInfo: any): Promise<void> {
    let isCurrentUser = await this.getUser(userInfo.sub);

    if (isCurrentUser === null) {
      const newUser = {
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

  async getUser(uidGiven: string): Promise<UserInterface | null> {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length !== 0 ? response.at(0) : null;
  }
}
