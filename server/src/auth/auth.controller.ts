import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @UseGuards(LoginGuard)
  @Get('/token')
  async getToken(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(LoginGuard)
  @Get('/user')
  user(@Req() req: Request) {
    return this.authService.getUser(req.query.userID as string);
  }

}
