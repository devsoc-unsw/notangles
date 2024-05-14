import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';

import * as grpc from '@grpc/grpc-js';
import { TimetableConstraints } from '../proto/autotimetabler_pb';
import { AutoTimetablerClient } from '../proto/autotimetabler_grpc_pb';
import { autoDTO } from './dto/auto.dto';
import { config } from 'src/config';

@Injectable()
export class AutoService {
  async getAutoTimetable(@Body() autoService: autoDTO) {
    return getAuto(autoService);
  }
} 


export const getAuto = async (data: autoDTO) => {
  let client = new AutoTimetablerClient(config.auto, grpc.credentials.createInsecure());
  const constraints = new TimetableConstraints();

  constraints.setStart(data.start);
  constraints.setEnd(data.end);
  constraints.setDays(data.days);
  constraints.setGap(data.gap);
  constraints.setMaxdays(data.maxdays);
  
  data.periodInfoList.forEach(thisPeriod => {
    const thisPeriodInfo = new TimetableConstraints.PeriodInfo();

    thisPeriodInfo.setPeriodsperclass(thisPeriod.periodsPerClass)
    thisPeriodInfo.setPeriodtimesList(thisPeriod.periodTimes)
    thisPeriodInfo.setDurationsList(thisPeriod.durations)
    
    constraints.addPeriodinfo(thisPeriodInfo)
  })

  client.findBestTimetable(constraints, (err, response) => {
    if (err) {
      console.error('error was found: ' + err);
      throw new HttpException('An error occurred when handling the request.', HttpStatus.BAD_GATEWAY);
    } else {
      return JSON.stringify({ given: response.getTimesList(), optimal: response.getOptimal()});
    }
  });
};