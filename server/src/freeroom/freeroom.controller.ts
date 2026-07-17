import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseArrayPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FreeroomService } from './freeroom.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('freerooms')
export class FreeroomController {
  constructor(private freeroomService: FreeroomService) {}

  // TODO: This is just for testing, remove later, only the main route should be here
  // i.e. GET /freerooms
  // @Get()

  @Get('by-buildings')
  // @UseGuards(AuthenticatedGuard)
  async getFreeRoomsInBuildings(
    // @Req() req: AuthenticatedRequest,
    @Query(
      'buildingIds',
      new ParseArrayPipe({ items: String, separator: ',', optional: false }),
    )
    buildingIds: string[],
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
    }

    if (!buildingIds.length || buildingIds[0] == '') {
      throw new HttpException(
        'buildingIds cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    const freerooms = await this.freeroomService.getFreeRoomsInBuildings(
      buildingIds,
      start,
      end,
    );
    return freerooms;
  }
}
