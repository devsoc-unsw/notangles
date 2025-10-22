import { Controller, Get, Body, Post, Req, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import {
  CreateFriendRequestDto,
  CancelFriendRequestDto,
  AcceptFriendRequestDto,
  RejectFriendRequestDto,
  RemoveFriendDto,
} from './types';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() createFriendRequest: CreateFriendRequestDto,
  ) {
    await this.friendshipService.createRelationship(
      await this.friendshipService.fetchUserFriendCode(req.user.id),
      createFriendRequest.requesteeCode,
    );
  }

  @Post('cancel')
  @UseGuards(AuthenticatedGuard)
  async cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() cancelFriendRequest: CancelFriendRequestDto,
  ) {
    await this.friendshipService.deleteRelationship(
      await this.friendshipService.fetchUserFriendCode(req.user.id),
      cancelFriendRequest.requesteeCode,
      true,
    );
  }

  @Get('requests')
  @UseGuards(AuthenticatedGuard)
  async getOutgoingFriendRequests(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.getUserFriendRequests(userCode);
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUserFriends(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.getUserFriendships(userCode);
  }

  @Post('accept')
  @UseGuards(AuthenticatedGuard)
  async acceptFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() acceptFriendRequest: AcceptFriendRequestDto,
  ) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.acceptFriendRequest(
      userCode,
      acceptFriendRequest.requestorCode,
    );
  }

  @Post('reject')
  @UseGuards(AuthenticatedGuard)
  async rejectFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() rejectFriendRequest: RejectFriendRequestDto,
  ) {
    await this.friendshipService.deleteRelationship(
      await this.friendshipService.fetchUserFriendCode(req.user.id),
      rejectFriendRequest.requestorCode,
      false,
    );
  }

  @Post('remove')
  @UseGuards(AuthenticatedGuard)
  async removeFriend(
    @Req() req: AuthenticatedRequest,
    @Body() removeFriendRequest: RemoveFriendDto,
  ) {
    await this.friendshipService.deleteFriendship(
      await this.friendshipService.fetchUserFriendCode(req.user.id),
      removeFriendRequest.otherCode,
    );
  }
}
