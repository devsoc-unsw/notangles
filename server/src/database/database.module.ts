import { Module } from '@nestjs/common';
import { Mongoose } from 'mongoose';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { UserSettingsSchema, UserTimetableSchema } from './schemas';
import { SessionSerializer } from 'src/auth/session.serializer';
@Module({
    imports: [MongooseModule.forFeature([{name: 'UserSettings', schema: UserSettingsSchema}, {name: 'UserTimetable', schema: UserTimetableSchema}])],
    controllers: [DatabaseController],
    providers: [DatabaseService, SessionSerializer]
})
export class DatabaseModule {}
