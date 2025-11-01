import { Body, Controller, Param, Post, UseGuards, Req } from '@nestjs/common';

import { AutoService } from './auto.service';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import { ConstraintDTO } from './types';

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
    const autoTimetable = await this.autoService.generateAutoTimetable(
      req.user.id,
      timetableId,
      data,
    );
    return autoTimetable;
    // TODO Update the timetable with the generated auto timetable on prisma
  }
}
