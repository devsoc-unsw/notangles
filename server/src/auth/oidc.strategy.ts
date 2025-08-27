import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import {
  Configuration,
  discovery,
  fetchUserInfo,
  randomState,
  TokenEndpointResponse,
  TokenEndpointResponseHelpers,
  UserInfoResponse,
} from 'openid-client';
import { AuthenticateOptions } from 'openid-client/build/passport';
import { promisify } from 'util';
import { PrismaService } from 'src/prisma/prisma.service';
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
    private readonly config: Configuration,
    private readonly prisma: PrismaService,
  ) {
    super({
      config,
      scope: process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_SCOPE!,
      callbackURL: process.env.OAUTH2_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI!,
      name: 'oidc',
      passReqToCallback: true,
    });
  }

  authorizationRequestParams<TOptions extends AuthenticateOptions>(
    req: Request,
    options: TOptions,
  ): URLSearchParams | Record<string, string> | undefined {
    const params = super.authorizationRequestParams(req, options);
    return {
      ...params,
      state: randomState(),
    };
  }

  async validate(
    req: Request,
    tokenset: TokenEndpointResponse & TokenEndpointResponseHelpers,
  ) {
    const claims = tokenset.claims();
    if (!claims) {
      throw new HttpException(
        'No claims found in tokenset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const userInfo: UserInfoResponse = await fetchUserInfo(
      this.config,
      tokenset.access_token,
      claims.sub,
    );

    const userData = userInfo.userData as {
      firstName: string;
      lastName: string;
      zid: string;
      department: string;
      program: number;
    };

    const user = await this.prisma.user.upsert({
      where: {
        oidcId: userInfo.sub,
      },
      update: {
        lastLogin: new Date(),
      },
      create: {
        oidcId: userInfo.sub,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isGuest: false,
      },
    });

    if (user.createdAt.getTime() === user.lastLogin.getTime()) {
      await this.prisma.settings.create({
        data: {
          userId: user.id,
        },
      });
    }

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
