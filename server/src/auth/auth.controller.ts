import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseGuards(LoginGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      this.authService.logoutUser(req.query.userID as string);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }
}
