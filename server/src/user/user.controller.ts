import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings } from './types';
import { GraphqlService } from 'src/graphql/graphql.service';
import type { Friendship } from '../graphql/types';
import type { FriendshipType } from '../graphql/types';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    oidcId?: string;
    isGuest: boolean;
  };
}

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly graphqlService: GraphqlService,
  ) {}

  // Send friend request -> post friendship (with state === reqByUserX)
  // Cancel friend request -> delete friendship
  // Get outgoing requests -> get friendships (with state ==== reqByUserX)
  // See incoming requests -> get friendships (including user but state !=== reqByUserX)
  // Accept request -> get incoming requests -> post state with user
  // Reject request -> get incoming requests -> post state with user

  // @Post('friendship')
  // @Get('friendships')
  // @Delete('friendship')
  // @Get('frienship')
  // @Get('friendship/outgoing')
  // @Get('friendship/incoming')
  //
  // async getFriendRequests(
  //   @Req(): AuthenticatedRequest,
  //   @Param('friendshpis') friendshipId:
  // )
  //
  //
  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userInfo = await this.userService.getUserInfo(req.user.id);
    return userInfo;
  }

  @Post('profile/picture')
  @UseGuards(AuthenticatedGuard)
  async setProfilePicture(
    @Req() req: AuthenticatedRequest,
    @Body('url') url: string,
  ) {
    await this.userService.setProfilePicture(req.user.id, url);
    return;
  }

  @Get('settings')
  @UseGuards(AuthenticatedGuard)
  async getSettings(@Req() req: AuthenticatedRequest) {
    const settings = await this.userService.getSettings(req.user.id);
    return settings;
  }

  @Post('settings')
  @UseGuards(AuthenticatedGuard)
  async setSettings(
    @Req() req: AuthenticatedRequest,
    @Body() settings: UserSettings,
  ) {
    await this.userService.setSettings(req.user.id, settings);
    return;
  }
}
