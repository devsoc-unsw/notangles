import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as sgMail from '@sendgrid/mail';
import { Model } from 'mongoose';
import { FriendRequestDocument } from 'src/friend/dtos/friend.dto';
import { UserDocument, UserInterface } from '../schemas/user.schema';
import { UserSettingsDto } from '../user/dtos/user.dto';
import { Request } from 'express';
import { UserinfoResponse } from 'openid-client';
import { User } from '@sentry/node';

export interface AuthenticatedRequest extends Request {
  user: UserinfoResponse;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('FriendRequest')
    private friendRequestModel: Model<FriendRequestDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccessToken(request: AuthenticatedRequest): Promise<string> {
    const jwtPayload = {
      sub: request.user.sub,
      email: request.user.email,
      givenName: request.user.given_name,
      familyName: request.user.family_name,
      picture: request.user.picture || '',
    };

    return this.jwtService.sign(jwtPayload, {
      secret: process.env.JWT_SECRET || 'secret',
    });
  }

  // TODO: Move the below functions into a users module
  async createUser(user: User) {
    let isCurrentUser: UserInterface = await this.getUser(user.sub);
    if (isCurrentUser === null) {
      const newUser = {
        // Adding new user information from google to the database
        userId: user.sub,
        firstname: user.given_name,
        lastname: user.family_name,
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        profileURL: user.picture,
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

        await this.sendEmail(user.email);
      } catch (error) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
    } else {
      // Updating the last login time of the user
      await this.userModel.findOneAndUpdate(
        { userId: user.sub },
        {
          $set: {
            profileURL: user.picture,
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
