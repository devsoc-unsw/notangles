import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInterface } from '../schemas/user.schema';
import * as sgMail from '@sendgrid/mail';
import { UserSettingsDto, UserTimetablesDto } from '../user/dtos/user.dto';
import { FriendRequestDocument } from 'src/friend/dtos/friend.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('FriendRequest')
    private friendRequestModel: Model<FriendRequestDocument>,
  ) {}

  async createUser(userInfo: any): Promise<void> {
    let isCurrentUser: UserInterface = await this.getUser(userInfo.sub);
    if (isCurrentUser === null) {
      const newUser = {
        // Adding new user information from google to the database
        google_uid: userInfo.sub,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        profileURL: userInfo.picture,
        loggedIn: true,
        settings: new UserSettingsDto(
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
        ),
        friends: [],
        timetables: [],
      };

      const userAdded = new this.userModel(newUser);
      userAdded.save();

      // This is the friend request Model
      try {
        await new this.friendRequestModel({
          userId: newUser.google_uid,
          friendRequests: [],
        }).save();
      } catch (error) {
        console.log(error);
      }

      console.log('adding new user!');
      await this.sendEmail(userInfo.email);
    } else {
      // Updating the last login date of the user
      await this.userModel.findOneAndUpdate(
        { google_uid: userInfo.sub },
        {
          $set: {
            profileURL: userInfo.picture,
            lastLogin: new Date(),
            loggedIn: true,
          },
        },
      );
    }
  }

  async getUser(uidGiven: string): Promise<UserInterface> {
    const response = await this.userModel.findOne({ google_uid: uidGiven });
    return response;
  }

  async logoutUser(uidGiven: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { google_uid: uidGiven },
      {
        $set: {
          loggedIn: false,
        },
      },
    );
  }

  async sendEmail(userEmail: string): Promise<any> {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: userEmail,
      from: 'notangles@csesoc.org.au',
      subject: 'Notangles',
      text: 'Welcome to Notangles!',
      html: '<strong>Some message here!</strong>',
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent!');
      })
      .catch((error) => {
        console.error('Error occured: ', error);
      });
  }

  //  TODO: Delete all the functions below this line.
  async delAllUsers(): Promise<void> {
    this.userModel.deleteMany({}).then(() => {
      console.log('[Users] Remove this delete many from auth.service.ts');
    });
  }

  async delAllFr(): Promise<void> {
    this.friendRequestModel.deleteMany({}).then(() => {
      console.log('[FR] Remove this delete many from auth.service.ts');
    });
  }
}
