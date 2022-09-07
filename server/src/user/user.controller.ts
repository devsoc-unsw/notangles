import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('profile')
  profile() {
    return this.userService.profile();
  }
  @Get('timetable')
  timetable() {
    return this.userService.timetable();
  }
}
