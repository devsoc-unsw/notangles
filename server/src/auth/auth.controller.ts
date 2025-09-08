import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthProvider } from 'src/generated/prisma/enums';
import { UserService } from 'src/user/user.service';

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
  constructor(private userService: UserService) {}

  @Get('login/github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('login/devsoc')
  @UseGuards(AuthGuard('oidc'))
  devsocLogin() {}

  @Get('callback/github')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Res() res: Response) {
    this.redirectAfterAuth(res);
  }

  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Res() res: Response) {
    this.redirectAfterAuth(res);
  }

  @Get('callback/devsoc')
  @UseGuards(AuthGuard('oidc'))
  callback(@Res() res: Response) {
    this.redirectAfterAuth(res);
  }

  @Get('login/guest')
  @UseGuards(AuthGuard('guest'))
  guest(@Res() res: Response) {
    this.redirectAfterAuth(res);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    let userId: string | undefined = undefined;
    if (req.isAuthenticated() && (req as AuthenticatedRequest).user.isGuest) {
      userId = (res.req as AuthenticatedRequest).user.id;
    }

    res.clearCookie('connect.sid');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req.logout((err) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      req.session?.destroy((err) => {
        this.redirectAfterAuth(res, false);
      });
    });

    if (userId) {
      await this.userService.deleteUser(userId);
    }
  }

  private redirectAfterAuth(res: Response, home: boolean = true) {
    res.redirect(
      (process.env.NODE_ENV === 'dev' ? `http://` : `https://`) +
        `${process.env.CLIENT_HOST_NAME}:${process.env.CLIENT_HOST_PORT}${home ? '/home' : ''}`,
    );
  }
}
