import { Module } from '@nestjs/common';
import { AutoController } from './auto.controller';

@Module({
  imports: [],
  controllers: [AutoController],
})
export class AutoModule {}
