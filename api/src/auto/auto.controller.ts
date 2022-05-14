import { Body, Controller, Post } from '@nestjs/common';
import { AutoDto } from './dtos/auto.dto';

@Controller('auto')
export class AutoController {
  @Post('/')
  async getAuto(@Body() body: AutoDto): Promise<any> {
    return null;
  }
}
