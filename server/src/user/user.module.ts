import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  userSchema,
  UserSettingsSchema,
  UserTimetableSchema,
} from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from '../database/database.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'UserSettings', schema: UserSettingsSchema },
      { name: 'UserTimetable', schema: UserTimetableSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [DatabaseService, SessionSerializer],
})
export class UserModule {}
