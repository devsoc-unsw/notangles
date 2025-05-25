import { Module } from '@nestjs/common';
import { CtfService } from './ctf.service';
import { CtfController } from './ctf.controller';

@Module({
  providers: [CtfService],
  controllers: [CtfController],
})
export class CtfModule {}
