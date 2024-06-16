import { Module } from '@nestjs/common';
import { AutoService } from './auto.service';
import { AutoController } from './auto.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'autotimetabler',
        transport: Transport.GRPC,
        options: {
          package: 'autotimetabler',
          protoPath: join(__dirname, '../proto/autotimetabler.proto'),
          url: `${process.env.AUTO_SERVER_HOST_NAME}:${process.env.AUTO_SERVER_HOST_PORT}`,
        },
      },
    ]),
  ],
  controllers: [AutoController],
  providers: [AutoService],
})
export class AutoModule {}
