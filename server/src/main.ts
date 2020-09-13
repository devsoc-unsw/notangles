import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';

import { EnvironmentService } from './modules/environment/environment.service';
import { ServerModule } from './modules/server/server.module';

async function bootstrap() {
  const server = await NestFactory.create(ServerModule);

  server.enableCors();

  const configService = server.get(ConfigService);
  const environmentService = server.get(EnvironmentService);

  const logger = new Logger('NotanglesServer');

  const port = configService.get<number>('SERVER_PORT', 8080);

  Sentry.init({
    debug: environmentService.isDevelopment(),
    dsn: configService.get<string>('SENTRY_DSN'),
    enabled: environmentService.isProduction(),
    environment: environmentService.getEnvironment(),
  });

  await server.listen(port);

  logger.log(`Listening on port ${port}.`);
}

bootstrap().then();
