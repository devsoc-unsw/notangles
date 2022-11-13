import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthenticatedRequest, AuthService } from './auth.service';
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
  async getToken(@Req() request: AuthenticatedRequest, response: Response) {
    if (!request.user) {
      response.sendStatus(401);
    }
    const accessToken = await this.authService.createAccessToken(request);
    return {
      accessToken,
      user: request.user,
    };
  }

  @UseGuards(TokenGuard)
  @Get('/user')
  user(@Req() request: AuthenticatedRequest) {
    return this.authService.getUser(request.user.sub);
  }

  @UseGuards(OIDCGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }
}
