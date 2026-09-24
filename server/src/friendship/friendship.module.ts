import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

@Module({
  providers: [FriendshipService, PrismaService],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
