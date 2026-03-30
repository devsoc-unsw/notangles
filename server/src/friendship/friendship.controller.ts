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
    @Body() body: CreateFriendRequestDto,
  ) {
    await this.friendshipService.createRelationship(
      req.user.id,
      body.requesteeCode,
    );
  }

  @Post('cancel')
  @UseGuards(AuthenticatedGuard)
  async cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: CancelFriendRequestDto,
  ) {
    await this.friendshipService.deleteRelationship(
      req.user.id,
      body.requesteeId,
      true, // current user is cancelling a request they sent
    );
  }

  @Get('requests/outgoing')
  @UseGuards(AuthenticatedGuard)
  async getOutgoingFriendRequests(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getUserFriendRequests(req.user.id);
  }

  @Get('requests/incoming')
  @UseGuards(AuthenticatedGuard)
  async getIncomingFriendRequests(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getFriendRequestsToUser(req.user.id);
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getUserFriends(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getUserFriendships(req.user.id);
  }

  @Post('accept')
  @UseGuards(AuthenticatedGuard)
  async acceptFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: AcceptFriendRequestDto,
  ) {
    await this.friendshipService.acceptFriendRequest(
      req.user.id,
      body.requestorId,
    );
  }

  @Post('reject')
  @UseGuards(AuthenticatedGuard)
  async rejectFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: RejectFriendRequestDto,
  ) {
    await this.friendshipService.deleteRelationship(
      req.user.id,
      body.requestorId,
      false, // current user is rejecting a request they received
    );
  }

  @Post('remove')
  @UseGuards(AuthenticatedGuard)
  async removeFriend(
    @Req() req: AuthenticatedRequest,
    @Body() body: RemoveFriendDto,
  ) {
    await this.friendshipService.deleteFriendship(req.user.id, body.friendId);
  }
}
