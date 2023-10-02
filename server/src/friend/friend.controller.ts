import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { friendDto, friendRequestDto } from './dto';
import { FriendService } from './friend.service';
@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}
  @Get(':userId')
  findAllFriends(@Param('userId') userId: string) {
    return this.friendService.findAllFriends(userId);
  }

  @Post()
  friendUsers(@Body() friendDto: friendDto) {
    return this.friendService.friendUsers(
      friendDto.senderId,
      friendDto.sendeeId,
    );
  }

  @Delete()
  unfriendUsers(@Body() friendDTO: friendDto) {
    return this.friendService.unfriendUsers(
      friendDTO.senderId,
      friendDTO.sendeeId,
    );
  }

  @Post('request')
  sendFriendRequest(@Body() friendDTO: friendDto) {
    return this.friendService.sendFriendRequest(
      friendDTO.senderId,
      friendDTO.sendeeId,
    );
  }

  @Delete('request')
  deleteFriendRequest(@Body() friendRequestDto: friendRequestDto) {
    return this.friendService.deleteFriendRequest(friendRequestDto.requestId);
  }
}
