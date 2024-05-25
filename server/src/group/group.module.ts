import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
})
export class GroupModule {}