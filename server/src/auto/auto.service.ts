import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { autoDTO } from './dto/auto.dto';
import config from "src/config"

const packageDef = protoLoader.loadSync(
  join(__dirname, '../proto/autotimetabler.proto'),
  { keepCase: true, defaults: true },
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = grpc.loadPackageDefinition(packageDef) as any;

@Injectable()
export class AutoService {
  async getAutoTimetable(data: autoDTO): Promise<string> {
    const client = new proto.autotimetabler.AutoTimetabler(
      config().auto,
      grpc.credentials.createInsecure(),
    );

    const request = {
      start: data.start,
      end: data.end,
      days: data.days,
      gap: data.gap,
      maxdays: data.maxdays,
      periodInfo: data.periodInfoList,
    };

    return new Promise<string>((resolve, reject) => {
      client.FindBestTimetable(
        request,
        { deadline: Date.now() + 30_000 },
        (err: grpc.ServiceError | null, res: { times: number[]; optimal: boolean }) => {
          client.close();
          if (err) {
            console.error('error was found:', err.code, err.details ?? err.message);
            reject(new HttpException('An error occurred when handling the request.', HttpStatus.BAD_GATEWAY));
          } else {
            resolve(JSON.stringify({ given: res.times, optimal: res.optimal }));
          }
        },
      );
    });
  }
}
