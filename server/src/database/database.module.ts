import { Module } from '@nestjs/common';
import { Mongoose } from 'mongoose';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { UserSettingsSchema, UserTimetableSchema } from './schemas';
import { SessionSerializer } from 'src/auth/session.serializer';
import { userSchema } from 'src/auth/schemas/user.schema';
@Module({
    imports: [MongooseModule.forFeature([{name: 'User', schema: userSchema}, {name: 'UserSettings', schema: UserSettingsSchema}, {name: 'UserTimetable', schema: UserTimetableSchema}])],
    controllers: [DatabaseController],
    providers: [DatabaseService, SessionSerializer]
})
export class DatabaseModule {}
