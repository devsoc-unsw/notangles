import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  userSchema,
  UserSettingsSchema,
  UserTimetableSchema,
} from 'src/auth/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'UserSettings', schema: UserSettingsSchema },
      { name: 'UserTimetable', schema: UserTimetableSchema },
    ]),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService, SessionSerializer],
})
export class DatabaseModule {}
