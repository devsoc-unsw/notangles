import { Body, Controller, Param, Post, UseGuards, Req } from '@nestjs/common';

import { AutoService } from './auto.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import { ConstraintDTO, AutoTimetableResult } from './types';

@Controller('user/autotimetable')
export class AutoController {
  constructor(private autoService: AutoService) {}

  @Post(':id')
  @UseGuards(AuthenticatedGuard)
  async generateAutoTimetable(
    @Req() req: AuthenticatedRequest,
    @Param('id') timetableId: string,
    @Body() data: ConstraintDTO,
  ) {
    const autoTimetableResult: AutoTimetableResult =
      await this.autoService.generateAutoTimetable(
        req.user.id,
        timetableId,
        data,
      );

    // TODO Update the timetable with the generated auto timetable on prisma
    await this.autoService.addTimetableToPrisma(
      autoTimetableResult,
      timetableId,
      req.user.id,
    );
  }
}
