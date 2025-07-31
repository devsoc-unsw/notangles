import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('login/devsoc')
  @UseGuards(AuthGuard('oidc'))
  login() {}

  @Get('callback/devsoc')
  @UseGuards(AuthGuard('oidc'))
  callback(@Res() res: Response) {
    res.redirect(
      (process.env.NODE_ENV === 'dev' ? `http://` : `https://`) +
        `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}`,
    );
  }
}
