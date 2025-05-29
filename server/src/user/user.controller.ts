import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings } from './types';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request) {
    const userInfo = await this.userService.getUserInfo(req.user!.id);
    return userInfo;
  }

  @Post('profile/picture')
  @UseGuards(AuthenticatedGuard)
  async setProfilePicture(@Req() req: Request, @Body('url') url: string) {
    await this.userService.setProfilePicture(req.user!.id, url);
    return;
  }

  @Get('settings')
  @UseGuards(AuthenticatedGuard)
  async getSettings(@Req() req: Request) {
    const settings = await this.userService.getSettings(req.user!.id);
    return settings;
  }

  @Post('settings')
  @UseGuards(AuthenticatedGuard)
  async setSettings(@Req() req: Request, @Body() settings: UserSettings) {
    await this.userService.setSettings(req.user!.id, settings);
    return;
  }
}
