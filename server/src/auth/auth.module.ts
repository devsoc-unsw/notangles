import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy } from './oidc.strategy';

@Module({
  controllers: [AuthController, PassportModule],
  providers: [AuthService, OidcStrategy]
})
export class AuthModule {}
