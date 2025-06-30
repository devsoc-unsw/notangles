import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getConfig, OidcStrategy } from './oidc.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { PrismaService } from 'src/prisma/prisma.service';

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
    AuthService,
    PrismaService,
    OidcStrategyFactory,
    SessionSerializer,
  ],
})
export class AuthModule {}
