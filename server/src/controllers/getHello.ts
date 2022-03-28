import { Response, Request } from 'express';
import * as util from 'util';

const grpc = require('grpc');
const messages = require('./autotimetabler_pb');
const services = require('./autotimetabler_grpc_pb');
const { stringToSubchannelAddress } = require('@grpc/grpc-js/build/src/subchannel-address');

export let getHello = async (req: Request, res: Response) => {
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