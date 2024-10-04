import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { friendDto } from './dto';
import { FriendService } from './friend.service';
@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}
  @Get(':userId')
  findAllFriends(@Param('userId') userId: string) {
    return this.friendService.findAllFriends(userId).then((data) => {
      return {
        status: "Found user's friends",
        data,
      };
    });
  }

  @Post()
  friendUsers(@Body() friendDTO: friendDto) {
    return this.friendService
      .friendUsers(friendDTO.senderId, friendDTO.sendeeId)
      .then((id) => {
        return {
          status: 'Successfully added users as friends!',
          data: {
            id,
          },
        };
      });
  }

  @Delete()
  unfriendUsers(@Body() friendDTO: friendDto) {
    return this.friendService
      .unfriendUsers(friendDTO.senderId, friendDTO.sendeeId)
      .then((id) => {
        return {
          status: 'Successfully removed users as friends!',
          data: {
            id,
          },
        };
      });
  }

  @Post('request')
  sendFriendRequest(@Body() friendDTO: friendDto) {
    return this.friendService.sendFriendRequest(
      friendDTO.senderId,
      friendDTO.sendeeId,
    );
  }

  @Delete('request')
  deleteFriendRequest(@Body() friendDTO: friendDto) {
    return this.friendService
      .deleteFriendRequest(friendDTO.senderId, friendDTO.sendeeId)
      .then((id) => {
        return {
          status: 'Successfully rejected friend request!',
          data: {
            senderId: id,
          },
        };
      });
  }
}
