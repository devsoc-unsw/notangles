import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}