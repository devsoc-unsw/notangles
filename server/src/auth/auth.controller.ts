import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthProvider } from 'src/generated/prisma/enums';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    authProvider?: AuthProvider;
    authSub?: string;
    isGuest: boolean;
  };
}

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
        `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}/home`,
    );
  }

  @Get('login/guest')
  @UseGuards(AuthGuard('guest'))
  guest(@Res() res: Response) {
    res.redirect(
      (process.env.NODE_ENV === 'dev' ? `http://` : `https://`) +
        `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}/home`,
    );
  }
}
