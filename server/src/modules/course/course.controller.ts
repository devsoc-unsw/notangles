import { Controller, Get, Query } from '@nestjs/common';

import { Course } from './course.model';
import { CourseService } from './course.service';
import { FindAllCourses } from './dto/findAllCourses.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query() query: FindAllCourses): Promise<Course[]> {
    return await this.courseService.findAll();
  }
}
