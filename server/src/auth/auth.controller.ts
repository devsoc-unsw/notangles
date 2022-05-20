import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './login.guard';
import { Issuer } from 'openid-client';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @Get('/user')
  user(@Request() req) {
    return req.user;
  }

  @UseGuards(LoginGuard)
  @Get('/callback')
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout();
    req.session.destroy(async () => {
      const TrustIssuer = await Issuer.discover(
        `${process.env.OIDC_ISSUER_BASE_URL}/.well-known/openid-configuration`,
      );
      const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
      if (end_session_endpoint) {
        res.redirect(
          end_session_endpoint +
            '?post_logout_redirect_uri=' +
            process.env.OAUTH2_REDIRECT_URI +
            (id_token ? '&id_token_hint=' + id_token : ''),
        );
      } else {
        res.redirect('/');
      }
    });
  }

  @Get('/signup')
  async createUsers() {
    let response = await this.authService.createUser({
      uid: "test1",
      google_uid: "test1-uid",
      zid: "z1",
      firstname: "test1",
      email: "test1@gmail.com",
    });
    console.log("Response from mongoDB", response);
  }
}
