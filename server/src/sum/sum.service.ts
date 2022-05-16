import { Injectable } from '@nestjs/common';

/**
 * Responsible for containing the logic that the controller uses to help it resolve
 * the REST request. This service will then get "injected" as a parameter to the controller's
 * constructor at runtime. We do this for better seperation of concerns, ~~and easier
 * testing.~~lol we don't do testing in this part of town 😎
 */
@Injectable()
export class SumService {
  /**
   * Takes two numbers, parses them to integers, and returns the sum of the two
   * @param num1 The first number to add
   * @param num2 The second number to add
   */
  public sum(num1: number, num2: number): number {
    return num1 + num2;
  }
}
