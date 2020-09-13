import Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmConfigService } from '../../configurations/typeorm.configuration';
import { EnvironmentModule } from '../environment/environment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production'),
        SENTRY_DSN: Joi.string(),
        TYPEORM_DATABASE: Joi.string(),
        TYPEORM_HOST: Joi.string(),
        TYPEORM_PASSWORD: Joi.string(),
        TYPEORM_PORT: Joi.number(),
        TYPEORM_SYNCHRONIZE: Joi.boolean(),
        TYPEORM_USERNAME: Joi.string(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, EnvironmentModule],
      useClass: TypeOrmConfigService,
    }),
  ],
})
export class ServerModule {}
