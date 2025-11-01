import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutoController } from './auto.controller';
import { AutoService } from './auto.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlService } from 'src/graphql/graphql.service';
import { TimetableService } from 'src/timetable/timetable.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'autotimetabler',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const host: string | undefined = configService.get(
            'AUTO_SERVER_HOST_NAME',
          );
          const port: string | undefined = configService.get(
            'AUTO_SERVER_HOST_PORT',
          );
          return {
            transport: Transport.GRPC,
            options: {
              package: 'autotimetabler',
              protoPath: join(
                __dirname,
                '../../../../auto_server/autotimetabler.proto',
              ),
              url: `${host}:${port}`,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [AutoService, PrismaService, GraphqlService, TimetableService],
  controllers: [AutoController],
})
export class AutoModule {}
