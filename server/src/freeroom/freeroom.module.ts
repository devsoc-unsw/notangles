import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreeroomController } from './freeroom.controller';
import { FreeroomService } from './freeroom.service';
import { GraphqlService } from 'src/graphql/graphql.service';

@Module({
  providers: [FreeroomService, PrismaService, GraphqlService],
  controllers: [FreeroomController],
})
export class FreeroomModule {}
