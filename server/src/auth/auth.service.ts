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

    async createUser(userInfo: userInterface): Promise<user> {
        const newUser = new this.userModel(userInfo);
        console.log("newUser object from auth.service =======\n");
        return newUser.save();
    }

    async getUser(uidGiven: string): Promise<boolean> {
        var response = await this.userModel.find({ uid: uidGiven });
        if(response.length === 0){ return false; }
        return true;
    }

}
