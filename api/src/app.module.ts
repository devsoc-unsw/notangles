import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SumController } from './sum/sum.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // so that we can pull in config
    AuthModule,
  ],
  controllers: [AppController, SumController],
  providers: [AppService],
})
export class AppModule {}
