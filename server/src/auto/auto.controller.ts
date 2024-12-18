import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AutoService } from './auto.service';
import { autoDTO } from './dto/auto.dto';

@Controller('auto')
export class AutoController {
  constructor(private readonly autoService: AutoService) {}

  @Post()
  async create(@Body() userRequestConstraints: autoDTO) {
    return await this.autoService.getAutoTimetable(userRequestConstraints);
  }
}
