import { Injectable, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { Issuer } from 'openid-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}
  async logout(@Request() req, @Res() res: Response): Promise<void> {
    const id_token = req.user ? req.user.id_token : undefined;

    const TrustIssuer = await Issuer.discover(
      `${process.env.OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`,
    );

    const postLogoutRedirect = this.configService.get<string>(
      'app.redirectLink',
      process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_POST_LOGOUT_REDIRECT_URI,
    );

    if (!id_token || !TrustIssuer) {
      return res.redirect(postLogoutRedirect);
    }

    const endSessionEndpoint = TrustIssuer.metadata.end_session_endpoint;

    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err);

        req.session.destroy((error) => {
          if (error) return reject(error);

          if (endSessionEndpoint && id_token) {
            res.redirect(
              `${endSessionEndpoint}?post_logout_redirect_uri=${postLogoutRedirect}&id_token_hint=${id_token}`,
            );
          } else {
            res.redirect(postLogoutRedirect);
          }

          resolve();
        });
      });
    });
  }
}
