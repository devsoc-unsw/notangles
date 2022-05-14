import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Setup NestJS
  const appOptions: NestApplicationOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.setGlobalPrefix('/api');

  // Setup Swagger
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Notangles API')
    .setDescription("An API for CSEProject's Notangles")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
