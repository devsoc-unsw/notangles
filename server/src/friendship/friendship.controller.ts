import {
  Controller,
  Get,
  Body,
  Post,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import {
  CreateFriendRequestDto,
  CancelFriendRequestDto,
  AcceptFriendRequestDto,
  RejectFriendRequestDto,
  Status,
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

  @Get()
  @UseGuards(AuthenticatedGuard)
  getFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Param('id') friendshipId: string,
  ): string {
    // todo: call this.friendshipService.getFriendship(userId, friendshipId)
    throw new Error('Unimplemented Route: getFriendRequest');
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  createFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() createFriendRequest: CreateFriendRequestDto,
  ) {
    // todo: call this.friendshipService.createFriendship(...)
    throw new Error('Unimplemented Route: createFriendRequest');
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  cancelFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() cancelFriendRequest: CancelFriendRequestDto,
  ) {
    // todo: handle this
    throw new Error('Unimplemented Route: createFriendRequest');
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  getOutgoingFriendRequests(@Req() req: AuthenticatedRequest): string {
    // todo: call this.friendshipService.getOutgoingFriendRequests(...)
    throw new Error('Unimplemented Route: getOutgoingFriendRequests');
  }

  @Get()
  @UseGuards(AuthenticatedGuard)
  getFriendRequests(@Req() req: AuthenticatedRequest): string {
    // todo: call this.friendshipService.getIncomingFriendRequests(...)
    // and other things :D
    throw new Error('Unimplemented Route: getIncomingFriendRequests');
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  acceptFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() acceptFriendRequest: AcceptFriendRequestDto,
  ) {
    // todo: call this.friendshipService.createFriendship(...)
    throw new Error('Unimplemented Route: acceptFriendRequest');
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  rejectFriendRequest(
    @Req() req: AuthenticatedRequest,
    @Body() rejectFriendRequest: RejectFriendRequestDto,
  ) {
    // todo: call this.friendshipService.rejectFriendRequest(...)
    throw new Error('Unimplemented Route: rejectFriendRequest');
  }

  // Todo: Do we really need a rejectExisting/mutual friend?
  // Does this require a seperate rest request?
}
