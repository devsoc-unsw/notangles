import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginGuard } from './login.guard';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { InitUserDTO, UserDTO } from 'src/user/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  login() {}

  checkUserDataUpdatedBeforeLogin = (
    userData: UserDTO,
    updatedUserData: InitUserDTO,
  ) => {
    if (
      userData.firstname !== updatedUserData.firstname ||
      userData.lastname !== updatedUserData.lastname ||
      userData.email !== updatedUserData.email
    ) {
      return true;
    }

    return false;
  };
  @Get('/user')
  async user(@Request() req, @Res() res: Response) {
    if (req.user) {
      const userID = req.user.userinfo.sub;
      const updateUserData = async () => {
        await this.userService.setUserProfile({
          userID: userID,
          email: '',
          firstname: req.user.userinfo.userData.firstName,
          lastname: req.user.userinfo.userData.lastName,
        });
      };
      try {
        const userData = await this.userService.getUserInfo(userID);
        if (
          this.checkUserDataUpdatedBeforeLogin(
            userData,
            req.user.userinfo.userData,
          )
        ) {
          console.debug(
            'The user ' +
              userID +
              ' has their profiles updated! Updating now :)',
          );
          updateUserData();
        }
      } catch (e) {
        console.debug(`User ${userID} does not exist in db, adding them now!`);
        updateUserData();
      }
      return res.json(req.user.userinfo.sub);
    }

    return res.json(req.user);
  }

  @UseGuards(LoginGuard)
  @Get('/callback/csesoc')
  loginCallback(@Res() res: Response) {
    console.log(
      this.configService.get<string>(
        'app.redirectLink',
        'https://notangles.devsoc.app/api/auth/callback/csesoc',
      ),
    );
    res.redirect(
      this.configService.get<string>(
        'app.redirectLink',
        'https://notangles.devsoc.app/api/auth/callback/csesoc',
      ),
    );
  }

  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    this.authService.logout(req, res);
  }
}
