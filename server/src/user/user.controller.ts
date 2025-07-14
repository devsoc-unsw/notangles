import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings, AddCourseDto, SetCourseColourDto } from './types';

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

  @Post('course')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: AuthenticatedRequest,
    @Body() addCourseDto: AddCourseDto,
  ) {
    await this.userService.addCourse(req.user.id, addCourseDto);
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

  @Patch('course/colour')
  @UseGuards(AuthenticatedGuard)
  async setCourseColour(
    @Req() req: AuthenticatedRequest,
    @Body() setCourseColourDto: SetCourseColourDto,
  ) {
    await this.userService.setCourseColour(req.user.id, setCourseColourDto);
  }

  @Get('classes/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async getSelectedClassesId(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    return await this.userService.getSelectedClassesId(
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
}
