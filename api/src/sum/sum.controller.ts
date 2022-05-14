import { Controller, Post, Query } from '@nestjs/common';

@Controller('sum')
export class SumController {
  @Post('/')
  sum(@Query('num1') num1: string, @Query('num2') num2: string): number {
    console.log(num1);

    return Number.parseInt(num1) + Number.parseInt(num2);
  }
}
