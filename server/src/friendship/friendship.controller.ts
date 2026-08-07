import {
  Controller,
  Get,
  Body,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import {
  CreateFriendRequestDto,
  CancelFriendRequestDto,
  AcceptFriendRequestDto,
  RejectFriendRequestDto,
  RemoveFriendDto,
} from './types';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { NonGuestGuard } from 'src/auth/non-guest.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('friendship')
@UseGuards(AuthenticatedGuard, NonGuestGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: CancelFriendRequestDto,
  ) {
    await this.friendshipService.cancelFriendRequest(
      req.user.id,
      body.requesteeId,
    );
  }

  @Get('requests/outgoing')
  async getOutgoingFriendRequests(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getUserFriendRequests(req.user.id);
  }

  @Get('requests/incoming')
  async getIncomingFriendRequests(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getFriendRequestsToUser(req.user.id);
  }

  @Get()
  async getUserFriends(@Req() req: AuthenticatedRequest) {
    return await this.friendshipService.getUserFriendships(req.user.id);
  }

  @Post('accept')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() body: RejectFriendRequestDto,
  ) {
    await this.friendshipService.rejectFriendRequest(
      req.user.id,
      body.requestorId,
    );
  }

  @Post('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFriend(
    @Req() req: AuthenticatedRequest,
    @Body() body: RemoveFriendDto,
  ) {
    await this.friendshipService.deleteFriendship(req.user.id, body.friendId);
  }
}
