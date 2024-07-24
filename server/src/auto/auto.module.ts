import { Module } from '@nestjs/common';
import { AutoService } from './auto.service';
import { AutoController } from './auto.controller';

@Module({
  controllers: [AutoController],
  providers: [AutoService],
})
export class AutoModule {}
