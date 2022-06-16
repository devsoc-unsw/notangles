import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserInterface } from './schemas/user.schema';


@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async createUser(userInfo: any): Promise<void> {
    let isCurrentUser = await this.getUser(userInfo.sub);

    if (isCurrentUser === null) {
      console.log("NEW USER!");
      const newUser = {
        google_uid: userInfo.sub,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const userAdded = new this.userModel(newUser);
      userAdded.save();
      await this.sendEmail(userInfo.email);
    }
  }

  async getUser(uidGiven: string): Promise<UserInterface | null> {
    const response = await this.userModel.find({ google_uid: uidGiven });
    return response.length !== 0 ? response.at(0) : null;
  }

  async sendEmail(userEmail: string): Promise<any> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: userEmail,
      from: 'notangles@csesoc.org.au',
      subject: 'Notangles',
      text: 'Welcome to Notangles.',
      html: '<strong>Some message hear!</strong>',
    }
    sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent!');
    })
    .catch((error) => {
      console.error(error);
    })
  }
}
