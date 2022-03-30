import { Response, Request } from 'express';

import * as grpc from 'grpc';
import { TimetableConstraints } from '../proto/autotimetabler_pb';
import { AutoTimetablerClient } from '../proto/autotimetabler_grpc_pb';


type AutoData = TimetableConstraints.AsObject


export const getAuto = async (req: Request, res: Response) => {
  var client = new AutoTimetablerClient('localhost:50051', grpc.credentials.createInsecure());
  const constraints = new TimetableConstraints()
  const data: AutoData = req.body
  constraints.setStart(data.start)
  constraints.setEnd(data.end)
  constraints.setDays(data.days)
  constraints.setGap(data.gap)
  constraints.setMaxdays(data.maxdays)
  constraints.setPeriodsListSerialized(data.periodsListSerialized)
  client.findBestTimetable(constraints, (err, response) => {
      if (err) {
          console.log('error was found: ' + err);
      } else {
            res.send(JSON.stringify({given: response.getTimesList()}))
      }
  })

};