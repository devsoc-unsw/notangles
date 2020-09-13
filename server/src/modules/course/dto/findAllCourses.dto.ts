import { IsNotEmpty } from 'class-validator';

export class FindAllCourses {
  @IsNotEmpty()
  readonly year: number;

  @IsNotEmpty()
  readonly term: number;
}
