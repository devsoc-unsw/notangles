import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as sgMail from '@sendgrid/mail';
import { Model } from 'mongoose';
import { FriendRequestDocument } from 'src/friend/dtos/friend.dto';
import { UserDocument, UserInterface } from '../schemas/user.schema';
import { UserSettingsDto } from '../user/dtos/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('FriendRequest')
    private friendRequestModel: Model<FriendRequestDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: any) {
    const jwtPayload = {
      sub: user.userinfo.sub,
      email: user.userinfo.email,
    };

    return {
      access_token: this.jwtService.sign(jwtPayload, {
        secret: process.env.JWT_SECRET || 'secret',
      }),
    };
  }

  // TODO: Move the below functions into a users module
  async createUser(userInfo: any) {
    let isCurrentUser: UserInterface = await this.getUser(userInfo.sub);
    if (isCurrentUser === null) {
      const newUser = {
        // Adding new user information from google to the database
        userId: userInfo.sub,
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

      try {
        await new this.friendRequestModel({
          userId: newUser.userId,
          friendRequests: [],
        }).save();

        await this.sendEmail(userInfo.email);
      } catch (error) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
    } else {
      // Updating the last login time of the user
      await this.userModel.findOneAndUpdate(
        { userId: userInfo.sub },
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

  async getUser(uidGiven: string) {
    return await this.userModel.findOne({ userId: uidGiven });
  }

  async logoutUser(uidGiven: string) {
    await this.userModel.findOneAndUpdate(
      { userId: uidGiven },
      { $set: { loggedIn: false } },
    );
  }

  async sendEmail(userEmail: string) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: userEmail,
      from: 'notangles@csesoc.org.au',
      subject: 'Notangles',
      text: 'Welcome to Notangles!',
      html: '<strong>Some message here!</strong>',
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw error;
    }
  }
}
