import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { EnvironmentService } from '../modules/environment/environment.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  private readonly CONFIGURATION: Readonly<TypeOrmModuleOptions> = {
    autoLoadEntities: true,
    database: this.configService.get<string>('TYPEORM_DATABASE', 'jikanban'),
    host: this.configService.get<string>('TYPEORM_HOST', 'localhost'),
    password: this.configService.get<string>('TYPEORM_PASSWORD', 'jikanban'),
    port: this.configService.get<number>('TYPEORM_PORT', 5432),
    synchronize: this.configService.get<boolean>('TYPEORM_SYNCHRONIZE', false),
    type: 'postgres',
    username: this.configService.get<string>('TYPEORM_USERNAME', 'jikanban'),
  };

  private readonly TEST_CONFIGURATION: Readonly<TypeOrmModuleOptions> = {
    autoLoadEntities: true,
    database: ':memory:',
    synchronize: true,
    type: 'sqlite',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly environmentService: EnvironmentService,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.environmentService.isTest()
      ? this.TEST_CONFIGURATION
      : this.CONFIGURATION;
  }
}
