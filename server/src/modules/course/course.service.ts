import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './course.model';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findAll(year: number, term: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { term: term, year: year },
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<Course> {
    return await this.courseRepository.findOne({ code: code });
  }
}
