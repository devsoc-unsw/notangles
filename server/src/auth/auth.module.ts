import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github.strategy';
import { GoogleStrategy } from './google.strategy';
import { GuestStrategy } from './guest.strategy';
import { getConfig, OidcStrategy } from './oidc.strategy';
import { SessionSerializer } from './session.serializer';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (prismaService: PrismaService) => {
    const config = await getConfig();
    return new OidcStrategy(config, prismaService);
  },
  inject: [PrismaService],
};

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    OidcStrategyFactory,
    GithubStrategy,
    GoogleStrategy,
    GuestStrategy,
    SessionSerializer,
    AuthService,
  ],
})
export class AuthModule {}
