import { Controller, Get, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('profile')
  getProfile() {
    return this.userService.getProfile();
  }
  @Get('timetable')
  getTimetable() {
    return this.userService.getTimetable();
  }
}
