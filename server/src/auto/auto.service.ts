import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import { TimetableConstraints } from '../proto/autotimetabler_pb';
import { AutoTimetablerClient } from '../proto/autotimetabler_grpc_pb';
import { autoDTO } from './dto/auto.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AutoService {
  constructor(private configService: ConfigService) {}
  async getAutoTimetable(@Body() autoService: autoDTO): Promise<string> {
    const AUTO_SERVER_HOST = `${this.configService.get<string>('AUTO_SERVER_HOST_NAME')}:${this.configService.get<string>('AUTO_SERVER_HOST_PORT')}`;
    console.log(AUTO_SERVER_HOST);
    return await getAuto(autoService, AUTO_SERVER_HOST);
  }
}

interface getAutoParameter {
  (data: autoDTO, grpc_client_conn: string): Promise<string>;
}

export const getAuto: getAutoParameter = async (
  data: autoDTO,
  grpc_client_conn: string,
) => {
  const client = new AutoTimetablerClient(
    grpc_client_conn,
    grpc.credentials.createInsecure(),
  );
  const constraints = new TimetableConstraints();

  constraints.setStart(data.start);
  constraints.setEnd(data.end);
  constraints.setDays(data.days);
  constraints.setGap(data.gap);
  constraints.setMaxdays(data.maxdays);
  data.periodInfoList.forEach((thisPeriod) => {
    const thisPeriodInfo = new TimetableConstraints.PeriodInfo();

    thisPeriodInfo.setPeriodsperclass(thisPeriod.periodsPerClass);
    thisPeriodInfo.setPeriodtimesList(thisPeriod.periodTimes);
    thisPeriodInfo.setDurationsList(thisPeriod.durations);

    constraints.addPeriodinfo(thisPeriodInfo);
  });
  return new Promise<string>((resolve, reject) => {
    client.findBestTimetable(constraints, (err, response) => {
      if (err) {
        console.error('error was found: ' + err);
        reject(
          new HttpException(
            'An error occurred when handling the request.',
            HttpStatus.BAD_GATEWAY,
          ),
        );
      } else {
        resolve(
          JSON.stringify({
            given: response.getTimesList(),
            optimal: response.getOptimal(),
          }),
        );
      }
    });
  });
};
