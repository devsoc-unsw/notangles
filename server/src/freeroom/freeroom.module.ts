import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreeroomController } from './freeroom.controller';
import { FreeroomService } from './freeroom.service';

@Module({
  providers: [FreeroomService, PrismaService],
  controllers: [FreeroomController],
})
export class FriendshipModule {}