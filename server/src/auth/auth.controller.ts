import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { REDIRECT_LINK } from 'src/constants';
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
    const userInfo = req.user ? res.json(req.user.userinfo.sub) : res.json(req.user);
    return userInfo;
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
