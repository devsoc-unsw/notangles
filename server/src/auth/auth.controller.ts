import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './login.guard';
import { Issuer } from 'openid-client';
import { AuthDto } from './dtos';
import { log } from 'console';
const REDIRECT_LINK = 'http://localhost:5173';

@Controller('auth')
export class AuthController {
  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  @Get('/user')
  user(@Request() req, @Res() res: Response) {
    return res.json(req.user);
  }

  @UseGuards(LoginGuard)
  @Get('/callback/csesoc')
  loginCallback(@Res() res: Response) {
    res.redirect(REDIRECT_LINK);
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    const id_token = req.user ? req.user.id_token : undefined;

    const TrustIssuer = await Issuer.discover(
      `${process.env.OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`,
    );

    if (!id_token || !TrustIssuer) {
      return res.redirect(REDIRECT_LINK);
    }

    req.logout((err) => {
      req.session.destroy(async (error: any) => {
        const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
        if (end_session_endpoint) {
          res.redirect(
            end_session_endpoint +
              '?post_logout_redirect_uri=' +
              process.env
                .OAUTH2_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI +
              (id_token ? '&id_token_hint=' + id_token : ''),
          );
        }
      });
    });
  }
}
