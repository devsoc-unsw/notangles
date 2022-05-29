import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

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

  @Get('/user')
  user(@Request() req) {
    return this.authService.getUser(req.user === undefined ? null : req.user.userinfo.sub);
  }

  @UseGuards(LoginGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }
}
