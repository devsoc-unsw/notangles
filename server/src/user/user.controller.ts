import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings, CourseParameters } from './types';

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

  @Post('course/add')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: Request,
    @Body() courseParameters: CourseParameters,
  ) {
    const result = await this.userService.addCourse(
      req.user!.id,
      courseParameters,
    );

    if (!result.success) {
      throw new HttpException(
        result.message ? result.message : 'Unkown Error',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true, message: 'Course added successfully' };
  }

  @Post('course/remove')
  @UseGuards(AuthenticatedGuard)
  async removeCourse(
    @Req() req: Request,
    @Body() course: { courseId: string; timetableId: string; term: string },
  ) {
    const result = await this.userService.removeCourse(
      req.user!.id,
      course.courseId,
      course.timetableId,
    );

    if (!result.success) {
      throw new HttpException(
        result.message ? result.message : 'Unkown Error',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { success: true, message: 'Course removed successfully' };
  }
}
