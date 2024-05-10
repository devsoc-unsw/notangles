import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173', // Replace this in production.
    credentials: true, // Allow credentials (e.g., cookies) to be sent with the request
  });
  await app.listen(3001);
}
bootstrap();
