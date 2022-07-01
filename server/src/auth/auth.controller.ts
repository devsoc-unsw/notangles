<<<<<<< Updated upstream
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
=======
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
>>>>>>> Stashed changes
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
<<<<<<< Updated upstream
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @Get('/user')
  user(@Req() req: Request) {
    return this.authService.getUser(req.query.userID as string);
=======
  @Get('token')
  @UseGuards(LoginGuard)
  async token(@Req() req): Promise<any> {
    return req.user;
>>>>>>> Stashed changes
  }

  @UseGuards(LoginGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }
}
