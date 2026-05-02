import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import { EventParametersDto } from './types';

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

  @Post(':id/duplicate')
  @UseGuards(AuthenticatedGuard)
  async duplicateTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
  ) {
    const timetable = await this.timetableService.duplicateTimetable(
      req.user.id,
      timetableId,
    );
    return timetable;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async deleteTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
  ) {
    await this.timetableService.deleteTimetable(req.user.id, timetableId);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async reorderTimetables(
    @Req() req: AuthenticatedRequest,
    @Body('ids') orderedIds: string[],
  ) {
    await this.timetableService.reorderTimetables(req.user.id, orderedIds);
  }

  @Patch(':id/rename')
  @HttpCode(HttpStatus.NO_CONTENT)
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

  @Patch('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async clearTimetables(
    @Req() req: AuthenticatedRequest,
    @Query('year') year: number,
    @Query('term') term: string,
  ) {
    await this.timetableService.clearTimetables(req.user.id, year, term);
  }

  @Patch(':id/change-primary')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async makePrimary(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
  ) {
    await this.timetableService.makePrimary(req.user.id, timetableId);
  }

  @Get('courses/:timetableId')
  @UseGuards(AuthenticatedGuard)
  async getCourses(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
  ) {
    return await this.timetableService.getCourses(req.user.id, timetableId);
  }

  @Post('course/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body('colour') colour: string,
  ) {
    await this.timetableService.addCourse(
      req.user.id,
      timetableId,
      courseId,
      colour,
    );
    return HttpStatus.CREATED;
  }

  @Delete('course/:timetableId/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async removeCourse(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.timetableService.removeCourse(
      req.user.id,
      timetableId,
      courseId,
    );
  }

  @Patch('course/:timetableId/:courseId/colour')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async setCourseColour(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body('colour') colour: string,
  ) {
    await this.timetableService.setCourseColour(
      req.user.id,
      timetableId,
      courseId,
      colour,
    );
  }

  @Get('classes/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async getSelectedClassIds(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    return await this.timetableService.getSelectedClassIds(
      req.user.id,
      timetableId,
      courseId,
    );
  }

  @Patch('class/:timetableId/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async updateSelectedClass(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body('classId') classId: string,
  ) {
    await this.timetableService.updateSelectedClass(
      req.user.id,
      timetableId,
      courseId,
      classId,
    );
  }

  @Delete('class/:timetableId/:courseId/:classId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async removeSelectedClass(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Param('classId') classId: string,
  ) {
    await this.timetableService.removeSelectedClass(
      req.user.id,
      timetableId,
      courseId,
      classId,
    );
  }

  @Get('event/:eventId')
  @UseGuards(AuthenticatedGuard)
  async getEventById(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
  ) {
    try {
      const eventDetails = await this.timetableService.getEvent(
        req.user.id,
        eventId,
      );
      return eventDetails;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get event details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('event/:timetableId')
  @UseGuards(AuthenticatedGuard)
  async addEvent(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Body() body: { event: EventParametersDto },
  ) {
    try {
      await this.timetableService.addEvent(
        req.user.id,
        body.event,
        timetableId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to add event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return HttpStatus.CREATED;
  }

  @Delete('event/:eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async deleteEvent(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
  ) {
    try {
      await this.timetableService.removeEvent(req.user.id, eventId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('event/:eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthenticatedGuard)
  async updateEvent(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: EventParametersDto,
  ) {
    try {
      await this.timetableService.updateEvent(req.user.id, eventId, body);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
