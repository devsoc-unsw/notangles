import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { Timetable, Settings, UserInterface } from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import {
  UserSettingsDto,
  UserTimetablesDto,
} from '../database/dtos/database.dto';
import { User } from '@sentry/node';
import { DatabaseService } from 'src/database/database.service';

@Controller('user')
export class UserController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/profile/:userId')
  async user(@Request() req): Promise<User | null> {
    return this.databaseService.getUser(req.params.userId);
  }

  @Get('/search')
  async userSearch(@Request() req): Promise<User | null> {
    if (req.query.userId) {
      return this.databaseService.getUser(req.query.userId);
    } else if (req.query.userFullName) {
      return this.databaseService.getUserByFullName(req.query.userFullName);
    }
  }

  // utility function to get all the users in database.
  @Get('/users')
  async users(): Promise<User | null> {
    return this.databaseService.getAllUsers();
  }

  // @UseGuards(<guardhere>)
  @Get('/settings/:userId')
  async getSettings(@Request() req): Promise<UserSettingsDto> {
    // this.databaseService.getSettings(req.query.userId).then((r) => {
    //   console.log(r);
    // });
    return this.databaseService.getSettings(req.query.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/settings/:userId')
  async createSettings(
    @Request() req,
    @Body() body: UserSettingsDto,
  ): Promise<Settings> {
    return this.databaseService.createSettings(body, req.params.userId);
  }

  // @UseGuards(<guardhere>)
  @Get('/timetable/:userId')
  async getTimetable(@Request() req): Promise<Timetable> {
    return this.databaseService.getTimetable(req.params.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/timetable/:userId')
  async createTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<Timetable> {
    return this.databaseService.createTimetable(body, req.params.userId);
  }

  //   // @UseGuards(<guardhere>)
  //   @Put('/timetable')
  //   async editTimetable(
  //     @Request() req,
  //     @Body() body: UserTimetablesDto,
  //   ): Promise<Timetable> {
  //     return this.databaseService.createTimetable(body, req.params.userId);
  //   }

  // @UseGuards(<guardhere>)
  @Delete('/timetable/:userId')
  async deleteTimetable(@Request() req): Promise<Timetable> {
    return this.databaseService.deleteTimetable(req.params.userId);
  }
}
