import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInterface } from '../schemas/user.schema';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async createUser(userInfo: any): Promise<void> {
    let isCurrentUser = await this.getUser(userInfo.sub);
    if (isCurrentUser === null) {
      const newUser = {
        // Adding new user information from google to the database
        google_uid: userInfo.sub,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 10),
        profileURL: userInfo.picture,
      };
      const userAdded = new this.userModel(newUser);
      userAdded.save();
      await this.sendEmail(userInfo.email);
    } else {
      // Updating the last login date of the user
      await this.userModel.findOneAndUpdate(
        { google_uid: userInfo.sub },
        {
          $set: {
            profileURL: userInfo.picture,
            lastLogin: new Date().toISOString().slice(0, 10),
            loggedIn: true,
          },
        },
      );
    }
  }

  async getUser(uidGiven: string): Promise<UserInterface | null> {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length !== 0 ? response.at(0) : null;
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
}
