import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  userSchema,
  UserSettingsSchema,
  UserTimetableSchema,
} from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { FriendController } from './friend.controller';
import { UserService } from 'src/user/user.service';
import { FriendService } from './friend.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'UserSettings', schema: UserSettingsSchema },
      { name: 'UserTimetable', schema: UserTimetableSchema },
    ]),
  ],
  controllers: [FriendController],
  providers: [UserService, FriendService, SessionSerializer],
})
export class FriendModule {}
