import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Request } from 'express';
import { UserSettings } from './types';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  async getProfile(@Req() req: Request) {
    const userInfo = await this.userService.getUserInfo(req.user!.id);
    return userInfo;
  }

  @Post('profile/picture')
  @UseGuards(AuthenticatedGuard)
  async setProfilePicture(@Req() req: Request, @Body('url') url: string) {
    await this.userService.setProfilePicture(req.user!.id, url);
    return;
  }

  @Get('settings')
  @UseGuards(AuthenticatedGuard)
  async getSettings(@Req() req: Request) {
    const settings = await this.userService.getSettings(req.user!.id);
    return settings;
  }

  @Post('settings')
  @UseGuards(AuthenticatedGuard)
  async setSettings(@Req() req: Request, @Body() settings: UserSettings) {
    await this.userService.setSettings(req.user!.id, settings);
    return;
  }

  @Get('timetables/:id')
  @UseGuards(AuthenticatedGuard)
  async getTimetable(@Req() req: Request, @Param('id') timetableId: string) {
    const timetable = await this.userService.getTimetable(
      req.user!.id,
      timetableId,
    );
    return timetable;
  }

  @Post('timetables')
  @UseGuards(AuthenticatedGuard)
  async createTimetable(
    @Req() req: Request,
    @Body() data: { name: string; year: number; term: string },
  ) {
    const timetable = await this.userService.createTimetable(
      req.user!.id,
      data,
    );
    return timetable;
  }

  @Delete('timetables/:id')
  @UseGuards(AuthenticatedGuard)
  async deleteTimetable(
    @Req() req: Request,
    @Param('id') timetableId: string,
    @Query('year') year: string,
    @Query('term') term: string,
  ) {
    await this.userService.deleteTimetable(
      req.user!.id,
      timetableId,
      Number(year),
      term,
    );
    return;
  }

  @Patch('timetables/:id/rename')
  @UseGuards(AuthenticatedGuard)
  async renameTimetable(
    @Req() req: Request,
    @Param('id') timetableId: string,
    @Body('name') newName: string,
  ) {
    await this.userService.renameTimetable(req.user!.id, timetableId, newName);
    return;
  }

  @Patch('timetables/:id/change-primary')
  @UseGuards(AuthenticatedGuard)
  async makePrimary(
    @Req() req: Request,
    @Param('id') timetableId: string,
    @Body() data: { year: number; term: string },
  ) {
    await this.userService.makePrimary(req.user!.id, timetableId, data);
    return;
  }
}
