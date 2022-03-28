import { Response, Request } from 'express';

const grpc = require('@grpc/grpc-js');
const messages = require('../proto/autotimetabler_pb');
const services = require('..proto/autotimetabler_grpc_pb');


export let getAutoTimetable = async (req: Request, res: Response) => {
  var client = new services.AutoTimetablerClient(
    'localhost:50051', grpc.credentials.createInsecure());
  client.findBestTimetable(new messages.TimetableConstraints(Object.values(req.body)), (err: any, response: any) => {
      if (err) {
          console.log('error was found: ' + err);
      } else {
            res.send(JSON.stringify({given: response?.getTimesList()}))
      }
  })

};