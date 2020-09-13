import { IsNotEmpty } from 'class-validator';

export class FindByCode {
  @IsNotEmpty()
  readonly code: string;
}
