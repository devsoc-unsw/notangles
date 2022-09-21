import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // so that we can pull in config
    AuthModule,
    MongooseModule.forRoot(`${process.env.DATABASE_URL}`),
    DatabaseModule,
    FriendModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
