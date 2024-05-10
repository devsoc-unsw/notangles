import { Response, Request } from 'express';

import * as grpc from '@grpc/grpc-js';
import { TimetableConstraints } from '../proto/autotimetabler_pb';
import { AutoTimetablerClient } from '../proto/autotimetabler_grpc_pb';
import { config } from '../config';

interface ReqBodyData {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number,
  periodInfoList: {
    periodsPerClass: number;
    periodTimes: Array<number>;
    durations: Array<number>;
  }[]
}


export const getAuto = async (req: Request, res: Response) => {
  var client = new AutoTimetablerClient(config.auto, grpc.credentials.createInsecure());
  const constraints = new TimetableConstraints();

  const data: ReqBodyData = req.body;
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
      console.log('error was found: ' + err);
      res.status(502).send('An error occurred when handling the request.')

    } else {
      res.send(JSON.stringify({ given: response.getTimesList(), optimal: response.getOptimal() }));
    }
  });
};
