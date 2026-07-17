import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendshipModule } from './friendship/friendship.module';
import { TimetableModule } from './timetable/timetable.module';
import { FreeroomModule } from './freeroom/freeroom.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      expandVariables: true,
    }),
    UserModule,
    FriendshipModule,
    TimetableModule,
    AuthModule,
    FreeroomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
