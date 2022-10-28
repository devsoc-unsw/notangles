import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { OIDCGuard } from './login.guard';
import { TokenGuard } from './token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(OIDCGuard)
  @Get('/login')
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @UseGuards(OIDCGuard)
  @Get('/token')
  async getToken(@Req() req: any) {
    const uid = req.user.userinfo.sub;
    const result = await this.authService.login(req.user);
    return { ...result, uid };
  }

  @UseGuards(TokenGuard)
  @Get('/user')
  user(@Req() req: Request) {
    return this.authService.getUser(req.query.id as string);
  }

  @UseGuards(OIDCGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }
}
