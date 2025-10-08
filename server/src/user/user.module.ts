import { Module } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MinioModule } from 'nestjs-minio-client';

@Module({
  imports: [
    MinioModule.register({
      endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESSKEY!,
      secretKey: process.env.MINIO_SECRETKEY!,
    }),
  ],
  providers: [UserService, PrismaService, GraphqlService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
