import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { REDIRECT_LINK } from '../config';
import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  @Get('/user')
  user(@Request() req, @Res() res: Response) {
    if (req.user) {
      return res.json(req.user.userinfo.sub);
    }

    return res.json(req.user);
  }

  @UseGuards(LoginGuard)
  @Get('/callback/csesoc')
  loginCallback(@Res() res: Response) {
    res.redirect(REDIRECT_LINK);
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    this.authService.logout(req, res);
  }
}