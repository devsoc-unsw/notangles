import { Body, Controller, Get, Param, Post, Query, Request, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoginGuard } from 'src/auth/login.guard';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from './database.service';
import { UserSettingsDto, UserTimetableDataDto } from './dtos/database.dto';
import { Settings, Timetable } from './schemas';

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
    async createSettings(@Body() body: UserSettingsDto): Promise<Settings> {
        return this.databaseService.createSettings(body)
    }

    // @UseGuards(<guardhere>)
    @Get('/timetable')
    async getTimetable(@Request() req): Promise<UserTimetableDataDto> {
        return this.databaseService.getTimetable(req.user.userId)
    }

    // @UseGuards(<guardhere>)
    @Post('/createtimetable')
    async createTimetable(@Body() body: UserTimetableDataDto): Promise<Timetable> {
        return this.databaseService.createTimetable(body)
    }
}
