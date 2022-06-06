import { Body, Controller, Get, Param, Post, Query, Request, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoginGuard } from 'src/auth/login.guard';
import { SessionSerializer } from 'src/auth/session.serializer';
import { DatabaseService } from './database.service';
import { UserSettingsDto, UserTimetableDataDto } from './dtos/database.dto';
import { Settings, Timetable } from './schemas';

// @UseInterceptors(SessionSerializer) // I think? (uncomment me when i work)
@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) {}

    // @UseGuards(<guardhere>)
    @Get('/settings')
    async getSettings(@Request() req): Promise<UserSettingsDto> {
        return this.databaseService.getSettings(req?.user?.userId ?? "dummy-id");
    }
    // @UseGuards(<guardhere>)
    @Post('/createsettings')
    async createSettings(@Request() req, @Body() body: UserSettingsDto): Promise<Settings> {
        return this.databaseService.createSettings(body, req?.user?.userId ?? "dummy-id")
    }

    // @UseGuards(<guardhere>)
    @Get('/timetable')
    async getTimetable(@Request() req): Promise<UserTimetableDataDto> {
        return this.databaseService.getTimetable(req?.user?.userId ?? "dummy-id")
    }

    // @UseGuards(<guardhere>)
    @Post('/createtimetable')
    async createTimetable(@Request() req, @Body() body: UserTimetableDataDto): Promise<Timetable> {
        return this.databaseService.createTimetable(body, req?.user?.userId ?? "dummy-id")
    }
}
