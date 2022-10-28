import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { FriendRequestSchema } from 'src/friend/dtos/friend.dto';
import { userSchema } from '../schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { buildOpenIdClient, OidcStrategy } from './oidc.strategy';
import { TokenStrategy } from './token.strategy';

const OidcStrategyFactory = {
  provide: 'OidcStrategy',
  useFactory: async (authService: AuthService) => {
    /** This Factory pattern will create a new instance of the OidcStrategy
     * and by injecting the AuthService. This will then be depended on down
     * below by the Auth Module.
     **/
    const client = await buildOpenIdClient();
    const strategy = new OidcStrategy(client);
    return strategy;
  },
  inject: [AuthService],
};

@Module({
  imports: [
    // Tell Nest to use Passport.
    PassportModule.register({ session: false, defaultStrategy: 'oidc' }),
    // Setup jwt
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
      { name: 'FriendRequest', schema: FriendRequestSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [OidcStrategyFactory, AuthService, JwtService, TokenStrategy],
})
export class AuthModule {}
