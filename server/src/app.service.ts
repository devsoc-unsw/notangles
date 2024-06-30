import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getServerConfig() {
    const env = this.configService.get<string>('NODE_ENV');
    const port = this.configService.get<number>('PORT');
    const auto = `${this.configService.get<string>('AUTO_SERVER_HOST_NAME')}:${this.configService.get<string>('AUTO_SERVER_HOST_PORT')}`;
    const client = `${this.configService.get<string>('CLIENT_HOST_NAME')}:${this.configService.get<string>('CLIENT_HOST_PORT')}`;
    const redirectLink = `${this.configService.get<string>('CLIENT_HOST_NAME')}:${this.configService.get<string>('CLIENT_HOST_PORT')}`;

    return {
      env,
      port,
      auto,
      client,
      redirectLink,
    };
  }
}
