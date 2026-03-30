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

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  async createFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() createFriendRequest: CreateFriendRequestDto,
  ) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );

    await this.friendshipService.createRelationship(
      userCode,
      createFriendRequest.requesteeCode,
    );
  }

  @Post('cancel')
  @UseGuards(AuthenticatedGuard)
  async cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() cancelFriendRequest: CancelFriendRequestDto,
  ) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );

    await this.friendshipService.deleteRelationship(
      userCode,
      cancelFriendRequest.requesteeCode,
      true, // current user is cancelling a request they sent
    );
  }

  @Get('requests/outgoing')
  @UseGuards(AuthenticatedGuard)
  async getOutgoingFriendRequests(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );

    return await this.friendshipService.getUserFriendRequests(userCode);
  }

  @Get('requests/incoming')
  @UseGuards(AuthenticatedGuard)
  async getIncomingFriendRequests(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.getFriendRequestsToUser(userCode);
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
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );

    await this.friendshipService.deleteRelationship(
      userCode,
      rejectFriendRequest.requestorCode,
      false, // current user is rejecting a request they received
    );
  }

  @Post('remove')
  @UseGuards(AuthenticatedGuard)
  async removeFriend(
    @Req() req: AuthenticatedRequest,
    @Body() removeFriendRequest: RemoveFriendDto,
  ) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );

    await this.friendshipService.deleteFriendship(
      userCode,
      removeFriendRequest.otherCode,
    );
  }
}
