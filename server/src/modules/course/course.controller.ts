import { Controller, Get, Query } from '@nestjs/common';

import { Course } from './course.model';
import { CourseService } from './course.service';
import { FindAllCourses } from './dto/findAllCourses.dto';
import { FindByCode } from './dto/findByCode.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query() query: FindAllCourses): Promise<Course[]> {
    return await this.courseService.findAll(query.year, query.term);
  }

  @Get()
  async findByCode(@Query() query: FindByCode): Promise<Course> {
    return await this.courseService.findByCode(query.code);
  }
}
