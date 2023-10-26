import { OpenIDConnectStrategy } from 'passport-openidconnect';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

const oidcConfig = {
    issuer: 'https://server.example.com',
    authorizationURL: 'https://server.example.com/authorize',
    tokenURL: 'https://server.example.com/token',
    userInfoURL: 'https://server.example.com/userinfo',
    clientID: process.env['CLIENT_ID'],
    clientSecret: process.env['CLIENT_SECRET'],
    callbackURL: 'https://client.example.org/cb'
};


@Injectable()
export class OidcStrategy extends PassportStrategy(OpenIDConnectStrategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(): Promise<any> {

  }
}