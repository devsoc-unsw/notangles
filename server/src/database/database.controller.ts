import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { Timetable, Settings } from 'src/auth/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from './database.service';
import { UserSettingsDto, UserTimetablesDto } from './dtos/database.dto';

@UseInterceptors(SessionSerializer) // I think?
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  // @UseGuards(<guardhere>)
  @Get('/settings')
  async getSettings(@Request() req): Promise<UserSettingsDto> {
    return this.databaseService.getSettings(req.user.userId);
  }
  // @UseGuards(<guardhere>)
  @Post('/createsettings')
  async createSettings(
    @Request() req,
    @Body() body: UserSettingsDto,
  ): Promise<Settings> {
    return this.databaseService.createSettings(body, req.user.userId);
  }

  // @UseGuards(<guardhere>)
  @Get('/timetable')
  async getTimetable(@Request() req): Promise<UserTimetablesDto> {
    return this.databaseService.getTimetable(req.user.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/createtimetable')
  async createTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<Timetable> {
    return this.databaseService.createTimetable(body, req.user.userId);
  }
}
