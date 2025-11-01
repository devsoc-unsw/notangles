import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TimetableModule } from './timetable/timetable.module';
import { AutoModule } from './auto/auto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      expandVariables: true,
    }),
    UserModule,
    TimetableModule,
    AuthModule,
    AutoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
