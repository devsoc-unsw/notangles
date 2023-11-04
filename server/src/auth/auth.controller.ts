import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './login.guard';
import { Issuer } from 'openid-client';
import { AuthDto } from './dtos';
import { log } from 'console';
import { REDIRECT_LINK } from 'src/constants';
import { AuthService } from './auth.service';

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
