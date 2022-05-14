import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy, buildOpenIdClient } from './oidc.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (authService: AuthService) => {
    /** This Factory pattern will create a new instance of the OidcStrategy
     * and by injecting the AuthService. This will then be depended on down
     * below by the Auth Module.
     **/
    const client = await buildOpenIdClient();
    const strategy = new OidcStrategy(authService, client);
    return strategy;
  },
  inject: [AuthService],
};

@Module({
  imports: [
    // Tell Nest to use Passport.
    PassportModule.register({ session: true, defaultStrategy: 'oidc' }),
  ],
  controllers: [AuthController],
  providers: [OidcStrategyFactory, SessionSerializer, AuthService],
})
export class AuthModule {}
