import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(AuthGuard('oidc'))
  login() {}

  @Get('callback/devsoc')
  @UseGuards(AuthGuard('oidc'))
  callback(@Res() res: Response) {
    res.redirect('http://localhost:3001/api/user/profile');
  }
}
