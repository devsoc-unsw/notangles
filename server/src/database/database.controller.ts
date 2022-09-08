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
}
