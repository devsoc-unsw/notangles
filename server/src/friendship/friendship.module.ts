import { Module } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipController } from './friendship.controller';

@Module({
  providers: [PrismaService, GraphqlService],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
