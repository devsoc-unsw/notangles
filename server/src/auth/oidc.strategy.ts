import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  Client,
  UserinfoResponse,
  TokenSet,
  Issuer,
} from 'openid-client';
import { AuthService } from './auth.service';

/**
 * Builder for the OIDC client.
 */
export const buildOpenIdClient = async () => {
  const TrustIssuer = await Issuer.discover(
    `${process.env.OIDC_ISSUER_BASE_URL}/.well-known/openid-configuration`,
  );
  const client = new TrustIssuer.Client({
    client_id: process.env.OAUTH2_CLIENT_ID,
    client_secret: process.env.OAUTH2_CLIENT_SECRET,
  });
  return client;
};

/**
 * Strategy for authenticating with an OpenID Connect provider.
 */
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  client: Client;

  constructor(private readonly authService: AuthService, client: Client) {
    super({
      client: client,
      params: {
        redirect_uri: process.env.OAUTH2_REDIRECT_URI,
        scope: process.env.OAUTH2_SCOPES,
      },
      passReqToCallback: false,
      usePKCE: false,
    });

    this.client = client;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const userinfo: UserinfoResponse = await this.client.userinfo(tokenset);

    try {
      const id_token = tokenset.id_token;
      const access_token = tokenset.access_token;
      const refresh_token = tokenset.refresh_token;
      const user = {
        id_token,
        access_token,
        refresh_token,
        userinfo,
      };
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
