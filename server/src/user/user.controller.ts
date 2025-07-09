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
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings, AddCourseDto } from './types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    oidcId?: string;
    isGuest: boolean;
  };
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userInfo = await this.userService.getUserInfo(req.user.id);
    return userInfo;
  }

  @Post('profile/picture')
  @UseGuards(AuthenticatedGuard)
  async setProfilePicture(
    @Req() req: AuthenticatedRequest,
    @Body('url') url: string,
  ) {
    await this.userService.setProfilePicture(req.user.id, url);
    return;
  }

  @Get('settings')
  @UseGuards(AuthenticatedGuard)
  async getSettings(@Req() req: AuthenticatedRequest) {
    const settings = await this.userService.getSettings(req.user.id);
    return settings;
  }

  @Post('settings')
  @UseGuards(AuthenticatedGuard)
  async setSettings(
    @Req() req: AuthenticatedRequest,
    @Body() settings: UserSettings,
  ) {
    await this.userService.setSettings(req.user.id, settings);
    return;
  }

  @Get('courses/:timetableId')
  @UseGuards(AuthenticatedGuard)
  async getCourseIds(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
  ) {
    return await this.userService.getCourseIds(req.user.id, timetableId);
  }

  @Post('course/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body() addCourseDto: AddCourseDto,
  ) {
    await this.userService.addCourse(
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
    await this.userService.removeCourse(req.user.id, timetableId, courseId);
  }

  @Patch('course/:timetableId/:courseId/colour')
  @UseGuards(AuthenticatedGuard)
  async setCourseColour(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body('colour') colour: string,
  ) {
    await this.userService.setCourseColour(
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
    return await this.userService.getSelectedClassIds(
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
    await this.userService.updateSelectedClass(
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
    await this.userService.removeSelectedClass(
      req.user.id,
      timetableId,
      courseId,
      classId,
    );
  }

  @Get('timetables/:id')
  @UseGuards(AuthenticatedGuard)
  async getTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
  ) {
    const timetable = await this.userService.getTimetable(
      req.user.id,
      timetableId,
    );
    return timetable;
  }

  @Get('timetables')
  @UseGuards(AuthenticatedGuard)
  async getUserTimetables(
    @Req() req: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('term') term: string,
  ) {
    const timetables = await this.userService.getUserTimetables(
      req.user.id,
      Number(year),
      term,
    );
    return timetables;
  }

  @Post('timetables')
  @UseGuards(AuthenticatedGuard)
  async createTimetable(
    @Req() req: AuthenticatedRequest,
    @Body() data: { name: string; year: number; term: string },
  ) {
    const timetable = await this.userService.createTimetable(
      req.user!.id,
      data,
    );
    return timetable;
  }

  @Delete('timetables/:id')
  @UseGuards(AuthenticatedGuard)
  async deleteTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Query('year') year: string,
    @Query('term') term: string,
  ) {
    await this.userService.deleteTimetable(
      req.user!.id,
      timetableId,
      Number(year),
      term,
    );
    return;
  }

  @Patch('timetables/:id/rename')
  @UseGuards(AuthenticatedGuard)
  async renameTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Body('name') newName: string,
  ) {
    await this.userService.renameTimetable(req.user!.id, timetableId, newName);
    return;
  }

  @Patch('timetables/:id/change-primary')
  @UseGuards(AuthenticatedGuard)
  async makePrimary(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Body() data: { year: number; term: string },
  ) {
    await this.userService.makePrimary(req.user!.id, timetableId, data);
    return;
  }
}
