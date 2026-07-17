import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { validate } from 'src/utils/validate';
import { FreeRooms } from 'src/graphql/types';

@Injectable()
export class FreeroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
  ) {}

  async getFreeRoomsInBuildings(
    buildingIds: string[],
    startTime: Date,
    endTime: Date,
  ): Promise<FreeRooms[]> {
    const result = await this.graphqlService.getFreeRooms(
      buildingIds,
      startTime,
      endTime,
    );

    validate(
      result.freeRooms.length > 0,
      'No free rooms found in these buildings',
      HttpStatus.NOT_FOUND,
    );

    return result.freeRooms;
  }
}
