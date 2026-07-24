import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GraphqlService } from "src/graphql/graphql.service";
import { validate } from "src/utils/validate";
import { FreeRooms } from "src/graphql/types";
import { toLocalXY, pointToSegmentDistance } from 'src/utils/geometry';
import { start } from "repl";

@Injectable()
export class FreeroomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly graphqlService: GraphqlService,
    ) {}

    async getFreeRoomsInBuildings(
        buildingIds: string[],
        startTime: Date,
        endTime: Date
    ): Promise<FreeRooms[]> {
        const result = await this.graphqlService.getFreeRooms(
            buildingIds,
            startTime,
            endTime
        );

        validate(
            result.freeRooms.length > 0,
            'No free rooms found in these buildings',
            HttpStatus.NOT_FOUND,
        );

        return result.freeRooms;
    }

async getBuildingsAlongRoute(
  startBuildingId: string,
  endBuildingId: string,
  maxOffsetDistance: number,
): Promise<string[]> {
  const allBuildings = await this.graphqlService.getAllBuildings();

  const startBuilding = allBuildings.find((b) => b.id === startBuildingId);
  const endBuilding = allBuildings.find((b) => b.id === endBuildingId);
  if (!startBuilding || !endBuilding) {
    return [];
  }

  validate(
    !!startBuilding,
    `Building with id ${startBuildingId} not found`,
    HttpStatus.NOT_FOUND,
  );
  validate(
    !!endBuilding,
    `Building with id ${endBuildingId} not found`,
    HttpStatus.NOT_FOUND,
  );

  const origin = { lat: startBuilding.lat, long: startBuilding.long };
  const a = toLocalXY(origin, origin);
  const b = toLocalXY(origin, { lat: endBuilding.lat, long: endBuilding.long });

  const buildingsWithinRange = allBuildings.filter((building) => {
    const p = toLocalXY(origin, { lat: building.lat, long: building.long });
    return pointToSegmentDistance(p, a, b) <= maxOffsetDistance;
  });

  validate(
    buildingsWithinRange.length > 0,
    'No buildings found within the specified distance',
    HttpStatus.NOT_FOUND,
  );

  return buildingsWithinRange.map((building) => building.id);
}
}