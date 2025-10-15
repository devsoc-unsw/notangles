import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github.strategy';
import { GoogleStrategy } from './google.strategy';
import { GuestStrategy } from './guest.strategy';
import { getConfig, OidcStrategy } from './oidc.strategy';
import { SessionSerializer } from './session.serializer';
import { GraphqlService } from 'src/graphql/graphql.service';
import { MinioModule } from 'nestjs-minio-client';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (authService: AuthService) => {
    const config = await getConfig();
    return new OidcStrategy(config, authService);
  },
  inject: [AuthService],
};

@Module({
  imports: [
    MinioModule.register({
      endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESSKEY!,
      secretKey: process.env.MINIO_SECRETKEY!,
    }),
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    UserService,
    GraphqlService,
    OidcStrategyFactory,
    GithubStrategy,
    GoogleStrategy,
    GuestStrategy,
    SessionSerializer,
    AuthService,
  ],
})
export class AuthModule {}
