import { Controller, Get, Param } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('profile/:userId')
  getUserInfo(@Param('userId') userId: string) {}
}
