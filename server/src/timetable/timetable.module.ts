import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
@Module({
  providers: [TimetableService, PrismaService, GraphqlService],
  controllers: [TimetableController],
})
export class TimetableModule {}
