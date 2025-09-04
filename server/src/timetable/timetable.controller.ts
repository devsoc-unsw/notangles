import {
  Body,
  Controller,
  Delete,
  Get,
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
import { AddCourseDto } from './types';

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

  @Get('courses/:timetableId')
  @UseGuards(AuthenticatedGuard)
  async getCourseIds(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
  ) {
    return await this.timetableService.getCourseIds(req.user.id, timetableId);
  }

  @Post('course/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body() addCourseDto: AddCourseDto,
  ) {
    await this.timetableService.addCourse(
      req.user.id,
      timetableId,
      courseId,
      addCourseDto,
    );
    return HttpStatus.CREATED;
  }

  @Delete('course/:timetableId/:courseId')
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
}
