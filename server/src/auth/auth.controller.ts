import {
  Controller,
  Get,
  Logger,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './login.guard';
import { Issuer } from 'openid-client';
import { AuthDto } from './dtos';
const REDIRECT_LINK = 'http://localhost:5173/';
@Controller('auth')
export class AuthController {
  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  @Get('/user')
  user(@Request() req) {
    
    return req.user;
  }

  @UseGuards(LoginGuard)
  @Get('/callback/csesoc')
  loginCallback(@Res() res: Response) {
    res.redirect(REDIRECT_LINK);
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    console.log("logout");
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout((err) => {
      if (err) {
        console.log(err + "omahgod errors");
      }
      req.session.destroy(async (error: any) => {
        const TrustIssuer = await Issuer.discover(
          `${process.env.OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`,
        );
        const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
          console.log(id_token);
        if (end_session_endpoint) {
          res.redirect(
            end_session_endpoint +
              '?post_logout_redirect_uri=' +
              process.env
                .OAUTH2_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI +
              (id_token ? '&id_token_hint=' + id_token : ''),
          );
        } else {
          res.redirect(REDIRECT_LINK);
        }
      });
    });
    
  }
}
