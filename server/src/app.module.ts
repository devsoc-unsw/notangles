import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AutoModule } from './auto/auto.module';
import config from './config';
import { FriendModule } from './friend/friend.module';
import { GroupModule } from './group/group.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { GraphqlService } from './graphql/graphql.service';
import { GraphqlModule } from './graphql/graphql.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      envFilePath: '../.env',
    }),
    AuthModule,
    AutoModule,
    UserModule,
    FriendModule,
    PrismaModule,
    GraphqlModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService, GraphqlService],
})
export class AppModule {}
