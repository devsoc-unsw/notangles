import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  @Get('/user')
  async user(@Request() req, @Res() res: Response) {
    if (req.user) {
      const userID = req.user.userinfo.sub;
      try {
        await this.userService.getUserInfo(userID);
      } catch (e) {
        console.debug(`User ${userID} does not exist in db, adding them now!`);
        await this.userService.setUserProfile(userID, '', '', '');
      }
      return res.json(req.user.userinfo.sub);
    }

    return res.json(req.user);
  }

  @UseGuards(LoginGuard)
  @Get('/callback/csesoc')
  loginCallback(@Res() res: Response) {
    res.redirect(this.configService.get<string>('app.redirectLink'));
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    this.authService.logout(req, res);
  }
}
