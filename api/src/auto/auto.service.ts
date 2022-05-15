import { Injectable, Logger } from '@nestjs/common';
import { config } from './config';
import { AutoTimetablerClient } from './proto/autotimetabler_grpc_pb';
import { credentials } from '@grpc/grpc-js';
import { AutoDto } from './dtos/auto.dto';
import { TimetableConstraints } from './proto/autotimetabler_pb';

@Injectable()
export class AutoService {
  // private readonly logger = new Logger(AutoService.name);
  // async getAuto(data: AutoDto) {
  //   const client = new AutoTimetablerClient(
  //     config.auto,
  //     credentials.createInsecure(),
  //   );
  //   const constraints = new TimetableConstraints();
  //   constraints
  //     .setStart(data.start)
  //     .setEnd(data.end)
  //     .setDays(data.days)
  //     .setGap(data.gap)
  //     .setMaxdays(data.maxdays);
  //   data.periodInfoList.forEach((period) => {
  //     const periodInfo = new TimetableConstraints.PeriodInfo();
  //     periodInfo
  //       .setPeriodsperclass(period.periodsPerClass)
  //       .setPeriodtimesList(period.periodTimes)
  //       .setDurationsList(period.durations);
  //     constraints.addPeriodinfo(periodInfo);
  //   });
  //   client.findBestTimetable(constraints, (err, response) => {
  //     if (err) {
  //       this.logger.error(err);
  //     } else {
  //       this.logger.log(response);
  //     }
  //   });
  // }
}
