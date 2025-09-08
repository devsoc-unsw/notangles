import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';
import { promisify } from 'util';

// TODO: Track usage of guest accounts, delete inactive ones
@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: Request) {
    const user = await this.authService.createUser({
      firstName: 'Guest',
      lastName: 'User',
      isGuest: true,
    });

    const login = promisify(req.login.bind(req));
    await login(user);
    return user;
  }
}
