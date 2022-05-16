import { Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SumService } from './sum.service';

/**
 * Handles the routes for the sum service.
 */
@Controller('sum')
export class SumController {
  constructor(private readonly sumService: SumService) {}

  /**
   * Handles the POST request to `/sum`.
   * The ParseIntPipe is used to parse the query params to integers from strings.
   * @param num1 First integer to add
   * @param num2 Second integer to add
   * @returns The sum of the two integers
   */
  @Post('/')
  async sum(
    @Query('num1', ParseIntPipe) num1: number,
    @Query('num2', ParseIntPipe) num2: number,
  ): Promise<number> {
    return this.sumService.sum(num1, num2);
  }
}
