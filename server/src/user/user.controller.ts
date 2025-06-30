import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings, AddCourseDto, SetCourseColourDto } from './types';
import { validate } from '../utils/validate';

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
  async getCourseIDs(
    @Req() req: Request,
    @Param('timetableId') timetableId: string,
  ) {
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    try {
      const courseIds = await this.userService.getCourseIDs(timetableId);
      return courseIds;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get courses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('course/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async getCourseDetails(
    @Req() req: Request,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.userService.isCourseInTimetable(
      courseId,
      timetableId,
    );
    validate(
      courseInTimetable,
      'Course is not in timetable',
      HttpStatus.NOT_FOUND,
    );
    try {
      const courseDetails = await this.userService.getCourse(
        courseId,
        timetableId,
      );
      return courseDetails;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get course details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('course')
  @UseGuards(AuthenticatedGuard)
  async addCourse(@Req() req: Request, @Body() addCourseDto: AddCourseDto) {
    const courseExistsOnGraphQL =
      await this.userService.isCourseExistsOnGraphQL(
        addCourseDto.courseId,
        addCourseDto.term,
      );
    validate(
      courseExistsOnGraphQL,
      'Course does not exist',
      HttpStatus.NOT_FOUND,
    );
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      addCourseDto.timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.userService.isCourseInTimetable(
      addCourseDto.courseId,
      addCourseDto.timetableId,
    );
    validate(
      courseInTimetable,
      'Course is in timetable already',
      HttpStatus.FORBIDDEN,
    );
    const colourValid = this.userService.isColourCodeValid(addCourseDto.colour);
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);
    try {
      await this.userService.addCourse(addCourseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to add course',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return HttpStatus.CREATED;
  }

  @Delete('course/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async removeCourse(
    @Req() req: Request,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    try {
      await this.userService.removeCourse(courseId, timetableId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to remove course',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('course/colour')
  @UseGuards(AuthenticatedGuard)
  async setCourseColour(
    @Req() req: Request,
    @Body() setCourseColourDto: SetCourseColourDto,
  ) {
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      setCourseColourDto.timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.userService.isCourseInTimetable(
      setCourseColourDto.courseId,
      setCourseColourDto.timetableId,
    );
    validate(
      courseInTimetable,
      'Course is not in timetable',
      HttpStatus.NOT_FOUND,
    );
    const colourValid = this.userService.isColourCodeValid(
      setCourseColourDto.colour,
    );
    validate(colourValid, 'Colour code is not valid', HttpStatus.BAD_REQUEST);
    try {
      await this.userService.setCourseColour(setCourseColourDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to set course colour',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('classes/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async getClasses(
    @Req() req: Request,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    const timetableExists = await this.userService.isTimetableExists(
      req.user!.id,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.userService.isCourseInTimetable(
      courseId,
      timetableId,
    );
    validate(
      courseInTimetable,
      'Course is not in timetable',
      HttpStatus.NOT_FOUND,
    );
    try {
      const classes = await this.userService.getClasses(courseId, timetableId);
      return classes;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get classes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('class/:id')
  @UseGuards(AuthenticatedGuard)
  async getClassDetails(@Req() req: Request, @Param('id') classId: string) {
    try {
      const classInfo = await this.userService.getClasseDetails(classId);
      return classInfo;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get class details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
