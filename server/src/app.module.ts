import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AutoModule } from './auto/auto.module';
import { FriendModule } from './friend/friend.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // so that we can pull in config
    AuthModule,
    AutoModule,
    MongooseModule.forRoot(`${process.env.DATABASE_URL}`),
    FriendModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
