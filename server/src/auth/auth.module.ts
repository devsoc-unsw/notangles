import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { buildOpenIdClient, OidcStrategy } from './oidc.strategy';
import { userSchema } from './schemas/user.schema';
import { SessionSerializer } from './session.serializer';

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
    MongooseModule.forRoot('mongodb://database.notangles-db:27017/Users'),
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
  ],
  controllers: [AuthController],
  providers: [OidcStrategyFactory, SessionSerializer, AuthService],
})
export class AuthModule {}
