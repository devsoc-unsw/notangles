import { Module } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

@Module({
  providers: [FriendshipService, PrismaService, GraphqlService],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
