import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { CalendarService } from './calendar.service';
@Module({
  providers: [TimetableService, PrismaService, GraphqlService, CalendarService],
  controllers: [TimetableController],
})
export class TimetableModule {}
