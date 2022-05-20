import { Module } from '@nestjs/common';
import { SumController } from './sum.controller';
import { SumService } from './sum.service';

/**
 * Like a package.json, this file is used to define the dependencies of this part
 * of the application.
 */
@Module({
  imports: [],
  controllers: [SumController],
  providers: [SumService],
})
export class SumModule {}
