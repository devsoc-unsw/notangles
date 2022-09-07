import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { Timetable, Settings, UserInterface } from 'src/schemas/user.schema';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from './database.service';
import { UserSettingsDto, UserTimetablesDto } from './dtos/database.dto';
import { User } from '@sentry/node';

// @UseInterceptors(SessionSerializer) // I think? (uncomment me when i work)
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/user')
  async user(@Request() req): Promise<User | null> {
    /**
     * The parameter is the user's google_uid
     * eg controller 1): api/database/user?userFullName=Raiyan_Ahmed
     *  will yield all the users with name Raiyan_Ahmed (note on the capitalisation)
     *  (note that this is not the same as the user's name in the database)
     *  TODO: make this more robust by changing it to lowercase from the getgo?
     *
     * eg controller 2): api/database/user?userId=<some google_uid>
     *  will yield the user with the google_uid that corresponds to the one in the database.
     *  this is unique to each user.
     */

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
  @Get('/settings')
  async getSettings(@Request() req): Promise<UserSettingsDto> {
    // this.databaseService.getSettings(req.query.userId).then((r) => {
    //   console.log(r);
    // });
    return this.databaseService.getSettings(req.query.userId);
  }
  // @UseGuards(<guardhere>)
  @Post('/createsettings')
  async createSettings(
    @Request() req,
    @Body() body: UserSettingsDto,
  ): Promise<Settings> {
    return this.databaseService.createSettings(body, req.query.userId);
  }

  // @UseGuards(<guardhere>)
  @Get('/timetable')
  async getTimetable(@Request() req): Promise<UserTimetablesDto> {
    return this.databaseService.getTimetable(req.query.userId);
  }

  // @UseGuards(<guardhere>)
  @Post('/createtimetable')
  async createTimetable(
    @Request() req,
    @Body() body: UserTimetablesDto,
  ): Promise<Timetable> {
    return this.databaseService.createTimetable(body, req.query.userId);
  }

  @Post('/savetimetable')
  async saveTimetable(@Request() req, @Body() body: UserTimetablesDto) {
    this.databaseService.saveUserTimetable(body, req.query.userId);
  }
}
