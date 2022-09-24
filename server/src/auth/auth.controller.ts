import { Controller, Delete, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserAuthInformation } from 'src/user/dtos/user.dto';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @UseGuards(LoginGuard)
  login() {
    // This function will not be run and instead intercepted by the LoginGuard.
    return;
  }

  @Get('/token')
  @UseGuards(LoginGuard)
  async getToken(@Req() req: Request) {
    return req.user;
  }

  @Get('/user')
  @UseGuards(LoginGuard)
  user(@Req() req: Request) {
    return this.authService.getUser(req.query.userID as string);
  }

  @Get('/callback')
  @UseGuards(LoginGuard)
  loginCallback(@Res() res: Response) {
    res.redirect('/');
  }

  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      this.authService.logoutUser(req.query.userID as string);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }

  // THIS IS FOR TESTING PURPOSES ONLY
  //TODO: VVVVVVVVVVVVVVVVVVVVVVVVVV DELETE FROM PROD
  @Get('/dummy')
  async addDummyUsers() {
    const user1: UserAuthInformation = {
      sub: '1',
      given_name: 'John',
      family_name: 'Doe',
      email: 'john@gmail.com',
      picture: 'https://www.google.com',
    };
    const user2: UserAuthInformation = {
      sub: '2',
      given_name: 'Jane',
      family_name: 'Doe',
      email: 'jane@gmail.com',
      picture: 'https://www.google.com',
    };

    const mj: UserAuthInformation = {
      sub: '101769509898880085974',
      given_name: 'Mun',
      family_name: 'Joon Teo',
      email: 'mun.joon.teo@csesoc.org.au',
      picture:
        'https://lh3.googleusercontent.com/a/ALm5wu18S3NDQ0Y-jIXJx4JjkHaxrjfiSWRK7fAdPy26=s96-c',
    };

    await this.authService.createUser(user1);
    await this.authService.createUser(user1);
    await this.authService.createUser(user2);
    await this.authService.createUser(mj);
  }

  @Delete('/delU')
  async deleteAllUsers() {
    await this.authService.delAllUsers();
  }

  @Delete('/delFr')
  async deleteFriendReq() {
    await this.authService.delAllFr();
  }
}
