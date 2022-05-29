import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  // Setup NestJS
  const appOptions: NestApplicationOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  // Authentication & Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET, // to sign session id
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Notangles API')
    .setDescription("An API for CSESoc Projects' Notangles")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT || 3001);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3001}`,
  );
}
bootstrap();
