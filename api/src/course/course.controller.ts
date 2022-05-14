import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('course')
export class CourseController {
  /**
   * Return a list of all courses.
   * @returns Course[]
   */
  @Get()
  findAll(): string {
    return 'This action returns all courses';
  }

  /**
   * Get a course's timetable.
   * @param id Course ID (ie: COMP1511)
   * @param term YYYY-term format
   * @returns Course
   */
  @Get('/:id')
  findOne(@Param('id') id: string, @Query('term') term: string): string {
    return `This action returns a #${id} course from term ${term}`;
  }
}
