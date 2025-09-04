import { Module } from '@nestjs/common';
import { GraphqlService } from 'src/graphql/graphql.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
@Module({
  providers: [TimetableService, PrismaService, GraphqlService],
  controllers: [TimetableController],
})
export class TimetableModule {}
