import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Notangles Backend API')
    .setDescription('Interactive API documentation for the Notangles backend')
    .setVersion('1.0')
    .addBearerAuth() // Add BearerAuth for secured endpoints
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(configService.get('port') ?? 3001);
}
bootstrap();
