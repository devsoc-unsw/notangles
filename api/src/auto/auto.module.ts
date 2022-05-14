import { Module } from '@nestjs/common';
import { AutoService } from './auto.service';
import { AutoController } from './auto.controller';

@Module({
  providers: [AutoService],
  controllers: [AutoController],
  imports: [],
})
export class AutoModule {}
