import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  providers: [UserService, PrismaService, GraphqlService],
  controllers: [UserController],
})
export class UserModule {}
