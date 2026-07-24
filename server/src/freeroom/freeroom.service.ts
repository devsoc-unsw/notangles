import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { validate } from 'src/utils/validate';
import { FreeRoom } from 'src/graphql/types';

@Injectable()
export class FreeroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly graphqlService: GraphqlService,
  ) {}

  // Main API call that, given a start and end building, interval, date and max offset,
  // generates a list of free rooms between them and returns a randomly chosen room
  async getFreeRoom(
    startTime: Date,
    endTime: Date,
    startBuildingId: string,
    endBuildingId: string,
    maxOffsetDistance: number,
  ): Promise<FreeRoom> {
    validate(
      startTime < endTime,
      'Start time must be before end time',
      HttpStatus.BAD_REQUEST,
    );

    validate(
      maxOffsetDistance >= 0,
      'Maximum offset cannot be negative',
      HttpStatus.BAD_REQUEST,
    );

    const buildingIdsAlongRoute: string[] = await this.getBuildingsAlongRoute(
      startBuildingId,
      endBuildingId,
      maxOffsetDistance,
    );

    const freeRooms = await this.getFreeRoomsInBuildings(
      buildingIdsAlongRoute,
      startTime,
      endTime,
    );

    const randomIndex = Math.floor(Math.random() * freeRooms.length);

    return freeRooms[randomIndex];
  }

  async getFreeRoomsInBuildings(
    buildingIds: string[],
    startTime: Date,
    endTime: Date,
  ): Promise<FreeRoom[]> {
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
