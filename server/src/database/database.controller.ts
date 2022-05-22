import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { LoginGuard } from 'src/auth/login.guard';
import { DatabaseService } from './database.service';
import { UserSettingsDto, UserTimetableDataDto } from './dtos/database.dto';
import { Settings, Timetable } from './schemas';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) {}

    // @UseGuards(<guardhere>)
    @Get('/settings') // temp stuff till user  stuff is set up
    async getSettings(@Request() req, @Param('userId') userID: string): Promise<UserSettingsDto> {
        return this.databaseService.getSettings(userID);
    }
    // @UseGuards(<guardhere>)
    @Post('/createsettings')
    async createSettings(@Body() body: UserSettingsDto): Promise<Settings> {
        return this.databaseService.createSettings(body)
    }

    // @UseGuards(<guardhere>)
    @Get('/timetable')
    async getTimetable(@Request() req, @Param('userId') userID: string): Promise<UserTimetableDataDto> {
        return this.databaseService.getTimetable(userID)
    }

    // @UseGuards(<guardhere>)
    @Post('/createtimetable')
    async createTimetable(@Body() body: UserTimetableDataDto): Promise<Timetable> {
        return this.databaseService.createTimetable(body)
    }
}
