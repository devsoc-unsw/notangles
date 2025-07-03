import { Body, Controller, Get, Post, Req, UseGuards, Param, HttpException, HttpStatus, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { UserSettings, EventParameters } from './types';
import { AuthenticatedRequest } from 'src/auth/auth.controller';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

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
  }

  @Get('event/:timetableId/:eventId')
  @UseGuards(AuthenticatedGuard)
  async getEventById(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('timetableId') timetableId: string
  ) {
      try {
        const eventDetails = await this.userService.getEvent(eventId, timetableId);
        return eventDetails;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw new HttpException('Failed to get event details', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  @Post('event')
  @UseGuards(AuthenticatedGuard)
  async addEvent(
    @Req() req: AuthenticatedGuard,
    @Body() event: EventParameters
  ) {
    try {
      await this.userService.addEvent(event);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to add event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return HttpStatus.CREATED;
  }

  @Delete('event/:timetableId/:eventId')
  @UseGuards(AuthenticatedGuard)
  async deleteEvent(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Param('eventId') eventId: string
  ) {
    try {
      await this.userService.removeEvent(eventId, timetableId)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to delete event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('event/:eventId')
  @UseGuards(AuthenticatedGuard)
  async updateEvent(
    @Req() req: AuthenticatedGuard,
    @Param('eventId') eventId: string,
    @Body() eventDetails: EventParameters
  ) {
    try {
      await this.userService.updateEvent(eventId, eventDetails);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to add event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
