import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(AuthGuard('oidc'))
  login() {
    // Handled by Passport redirect
  }

  @Get('callback/csesoc')
  @UseGuards(AuthGuard('oidc'))
  callback(@Req() req: Request) {
    return req.user; // user from validate()
  }
}
