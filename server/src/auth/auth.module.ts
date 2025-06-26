import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { getConfig, OidcStrategy } from './oidc.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (authService: AuthService) => {
    const config = await getConfig();
    return new OidcStrategy(authService, config);
  },
  inject: [AuthService],
};

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OidcStrategyFactory],
})
export class AuthModule {}
