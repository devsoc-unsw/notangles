import { AutoModule } from './auto/auto.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendModule } from './friend/friend.module';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { config } from './config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    // ClientsModule.register([
    //   {
    //     name: 'autotimetabler',
    //     transport: Transport.GRPC,
    //     options: {
    //       package: 'autotimetabler',
    //       protoPath: join(__dirname, './proto/autotimetabler.proto'),
    //       url: config.auto,
    //     },
    //   },
    // ]),
    AuthModule,
    AutoModule,
    UserModule,
    FriendModule,
    PrismaModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
