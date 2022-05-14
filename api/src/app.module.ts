import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { SumController } from './sum/sum.controller';

@Module({
  imports: [UserModule],
  controllers: [AppController, UserController, SumController],
  providers: [AppService, UserService],
})
export class AppModule {}
