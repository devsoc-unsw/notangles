import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { ClientGrpc, Client, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TimetableConstraintsDto } from './dtos/auto.dto';

interface AutoService {
  findBestTimetable(
    timetableConstraints: TimetableConstraintsDto,
  ): Promise<any>;
}

@Controller('auto')
export class AutoController implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      url: process.env.AUTO_SERVER_URI || 'localhost:50051',
      package: '',
      protoPath: join(__dirname, './auto.proto'),
    },
  })
  private readonly client: ClientGrpc;

  private autoService: AutoService;

  onModuleInit() {
    this.autoService = this.client.getService<AutoService>('AutoTimetabler');
  }

  @Post('/')
  async getAuto(@Body() data: TimetableConstraintsDto): Promise<any> {
    return this.autoService.findBestTimetable(data);
  }
}
