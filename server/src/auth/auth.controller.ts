import { Controller, Delete, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserAuthInformation } from 'src/user/dtos/user.dto';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @UseGuards(LoginGuard)
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @Get('/token')
  @UseGuards(LoginGuard)
  async getToken(@Req() req: Request) {
    return req.user;
  }

  @Get('/user')
  @UseGuards(LoginGuard)
  user(@Req() req: Request) {
    return this.authService.getUser(req.query.userID as string);
  }

  @Get('/callback')
  @UseGuards(LoginGuard)
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
