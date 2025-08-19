import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://notanglesstaging.devsoc.app',
      'https://notangles.devsoc.app',
    ],
  });

  // TODO: Validate session secret using configService
  // TODO: Experiment with secure: true
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') ?? 'secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get('port') ?? 3001);
}
void bootstrap();
