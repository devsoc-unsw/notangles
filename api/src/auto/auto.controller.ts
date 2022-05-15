import { Body, Controller, Post } from '@nestjs/common';
import { AutoService } from './auto.service';
import { AutoDto } from './dtos/auto.dto';

@Controller('auto')
export class AutoController {
  @Post('/')
  async getAuto(@Body() body: AutoDto): Promise<any> {
    return new AutoService().getAuto(body)
  }
}
