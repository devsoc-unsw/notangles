import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    oidcId?: string;
    isGuest: boolean;
  };
}

@Controller('user/timetables')
export class TimetableController {
  constructor(private timetableService: TimetableService) {}

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  async getTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
  ) {
    const timetable = await this.timetableService.getTimetable(
      req.user.id,
      timetableId,
    );
    return timetable;
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUserTimetables(
    @Req() req: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('term') term: string,
  ) {
    const timetables = await this.timetableService.getUserTimetables(
      req.user.id,
      Number(year),
      term,
    );
    return timetables;
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createTimetable(
    @Req() req: AuthenticatedRequest,
    @Body() data: { name: string; year: number; term: string },
  ) {
    const timetable = await this.timetableService.createTimetable(
      req.user.id,
      data,
    );
    return timetable;
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  async deleteTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Query('year') year: string,
    @Query('term') term: string,
  ) {
    await this.timetableService.deleteTimetable(
      req.user.id,
      timetableId,
      Number(year),
      term,
    );
  }

  @Patch(':id/rename')
  @UseGuards(AuthenticatedGuard)
  async renameTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Body('name') newName: string,
  ) {
    await this.timetableService.renameTimetable(
      req.user.id,
      timetableId,
      newName,
    );
  }

  @Patch(':id/change-primary')
  @UseGuards(AuthenticatedGuard)
  async makePrimary(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Body() data: { year: number; term: string },
  ) {
    await this.timetableService.makePrimary(req.user.id, timetableId, data);
  }
}
