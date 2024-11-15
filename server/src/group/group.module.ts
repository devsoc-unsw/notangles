import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService, UserService, GraphqlService],
})
export class GroupModule {}
