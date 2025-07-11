import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
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
import { validate } from '../utils/validate';
import { GraphqlService } from 'src/graphql/graphql.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    oidcId?: string;
    isGuest: boolean;
  };
}

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly graphqlService: GraphqlService,
  ) {}

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
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
      timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    try {
      return await this.userService.getCourseIds(timetableId);
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

  @Post('course')
  @UseGuards(AuthenticatedGuard)
  async addCourse(
    @Req() req: AuthenticatedRequest,
    @Body() addCourseDto: AddCourseDto,
  ) {
    const courseExistsOnGraphQL = await this.graphqlService.courseExists(
      addCourseDto.courseId,
      addCourseDto.term,
    );
    validate(
      courseExistsOnGraphQL,
      'Course does not exist',
      HttpStatus.NOT_FOUND,
    );
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
      addCourseDto.timetableId,
    );
    validate(timetableExists, 'Timetable does not exist', HttpStatus.NOT_FOUND);
    const courseInTimetable = await this.userService.isCourseInTimetable(
      addCourseDto.courseId,
      addCourseDto.timetableId,
    );
    validate(
      !courseInTimetable,
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
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
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

  @Patch('course/colour')
  @UseGuards(AuthenticatedGuard)
  async setCourseColour(
    @Req() req: AuthenticatedRequest,
    @Body() setCourseColourDto: SetCourseColourDto,
  ) {
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
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
  async getSelectedClassesID(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
  ) {
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
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

  @Patch('class/:timetableId/:courseId')
  @UseGuards(AuthenticatedGuard)
  async updateSelectedClass(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Body('classId') classId: string,
  ) {
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
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

    const classValidate = await this.graphqlService.getClassDetails(classId);
    validate(
      classValidate !== null,
      'Class does not exist',
      HttpStatus.NOT_FOUND,
    );
    validate(
      classValidate?.activity !== undefined &&
        classValidate?.activity !== 'Course Enrolment',
      'Class is not a valid class',
      HttpStatus.BAD_REQUEST,
    );

    try {
      await this.userService.updateSelectedClass(
        timetableId,
        courseId,
        classId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update selected class',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('class/:timetableId/:courseId/:classId')
  @UseGuards(AuthenticatedGuard)
  async removeSelectedClass(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('courseId') courseId: string,
    @Param('classId') classId: string,
  ) {
    const timetableExists = await this.userService.isTimetablePresent(
      req.user.id,
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

    const classValidate = await this.graphqlService.getClassDetails(classId);
    validate(
      classValidate !== null,
      'Class does not exist',
      HttpStatus.NOT_FOUND,
    );

    try {
      await this.userService.removeSelectedClass(
        timetableId,
        courseId,
        classId,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to remove selected class',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
