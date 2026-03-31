import {
  Controller,
  Get,
  Body,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import {
  CreateFriendRequestDto,
  AcceptFriendRequestDto,
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

  @Delete('requests/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    await this.friendshipService.deleteRequest(req.user.id, userId);
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

  @Post('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFriend(
    @Req() req: AuthenticatedRequest,
    @Body() body: RemoveFriendDto,
  ) {
    await this.friendshipService.deleteFriendship(req.user.id, body.friendId);
  }
}
