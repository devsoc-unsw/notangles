import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  // Setup NestJS
  const appOptions: NestApplicationOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);

  // Authentication & Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET, // to sign session id
      resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
      saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
      rolling: true, // keep session alive
      cookie: {
        maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Notangles API')
    .setDescription("An API for CSEProject's Notangles")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
