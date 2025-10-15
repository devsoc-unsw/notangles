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

  // [X] @post createFriendRequest
  // [X] @post cancelFriendRequest
  // [X] @get getOutgoingFriendRequests
  // [X] @get getIncomingFriendRequests
  // [X] @post acceptFriendRequest
  // [X] @post rejectFriendRequest
  // [X] @post removeMutualFriend

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

  @Post()
  @UseGuards(AuthenticatedGuard)
  async cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() cancelFriendRequest: CancelFriendRequestDto,
  ) {
    await this.friendshipService.deleteRelationship(
      await this.friendshipService.fetchUserFriendCode(req.user.id),
      cancelFriendRequest.requestorCode,
      true,
    );
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getOutgoingFriendRequests(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.getUserFriendRequests(userCode);
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getFriendRequests(@Req() req: AuthenticatedRequest) {
    const userCode = await this.friendshipService.fetchUserFriendCode(
      req.user.id,
    );
    return await this.friendshipService.getUserFriendships(userCode);
  }

  @Post()
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

  @Post()
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

  @Post()
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
