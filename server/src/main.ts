import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';
const { PrismaClient } = require('@prisma/client'); // pnpm breaks in production if require is not used.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      // 'http://localhost:5173',
      // 'https://notanglesstaging.devsoc.app',
      // 'https://notangles.devsoc.app/',
      '*',
    ],
    credentials: true, // Allow credentials (e.g., cookies) to be sent with the request
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      store: new PrismaSessionStore(new PrismaClient(), {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }), // where session will be stored
      secret: process.env.SESSION_SECRET, // to sign session id
      resave: false,
      saveUninitialized: false,

      rolling: true, // keep session alive
      cookie: {
        secure: false,
        maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3001);
}

bootstrap();
