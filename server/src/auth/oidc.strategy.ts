import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { discovery, Configuration, UserInfoResponse } from 'openid-client';
import { AuthService } from './auth.service';
const { Strategy } =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('openid-client/passport') as typeof import('openid-client/build/passport');

export const getConfig = async (): Promise<Configuration> => {
  return await discovery(
    new URL(
      `${process.env.OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER}/.well-known/openid-configuration`,
    ),
    process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID!,
    process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET,
  );
};

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor(
    private authService: AuthService,
    config: Configuration,
  ) {
    super({
      config,
      scope: process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_SCOPE!,
      callbackURL: process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI!,
      // passReqToCallback: true,
    });
  }

  validate(tokenset: any, userinfo: UserInfoResponse) {
    return {
      id: userinfo.sub,
      email: userinfo.email,
      name: userinfo.name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tokenset,
    };
  }
}
