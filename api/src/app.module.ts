import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseController } from './course/course.controller';
import { CourseService } from './course/course.service';
import { CourseModule } from './course/course.module';

@Module({
  imports: [CourseModule],
  controllers: [AppController, CourseController],
  providers: [AppService, CourseService],
})
export class AppModule {}
