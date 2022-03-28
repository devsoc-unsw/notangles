import { Response, Request } from 'express';
import * as util from 'util';

var PROTO_PATH = __dirname + '../../autotimetabler.proto';

// var parseArgs = require('minimist');
// var grpc = require('@grpc/grpc-js');
// var protoLoader = require('@grpc/proto-loader');
// var packageDefinition = protoLoader.loadSync(
//     PROTO_PATH,
//     {keepCase: true,
//      longs: String,
//      enums: String,
//      defaults: true,
//      oneofs: true
//     });
// var auto_proto = grpc.loadPackageDefinition(packageDefinition).autotimetabler;

const grpc = require('grpc');
const messages = require('./autotimetabler_pb');
const services = require('./autotimetabler_grpc_pb');
const { stringToSubchannelAddress } = require('@grpc/grpc-js/build/src/subchannel-address');





// export interface GetHelloParams {
//   message: string;
// }

/**
 * GET /api/terms/:termId/courses/:courseId/
 * termId expected in yyyy-term format
 */
export let getHello = async (req: Request, res: Response) => {
  // const params: any = req.params;
  console.log(req.body)
  const data = req.body
  // console.log('here')
  // const target = '[::]:9995'

  // console.log(auto_proto)

  var client = new services.AutoTimetablerClient(
    'localhost:50051', grpc.credentials.createInsecure());
  
    // res.send('hi')
    // return
  // var user = params.message
  // client.sayHello({name: user}, function(err: any, response: any) {
  // console.log('Greeting:', response.message);
  // res.send(JSON.stringify({resp: response.message}))
  // });


  var autoTimetableRequest = new messages.TimetableConstraints();
  autoTimetableRequest.setStart(parseInt(data['start']));
  autoTimetableRequest.setEnd(20); // parseInt(data['end']) 
  autoTimetableRequest.setDays(data['days']); 
  autoTimetableRequest.setGap(parseInt(data['gap'])); 
  autoTimetableRequest.setMaxdays(parseInt(data['maxdays']));
  autoTimetableRequest.setPeriodsListSerialized(data['periods'])
  client.findBestTimetable(autoTimetableRequest, (err: any, response: any) => {
      if (err) {
          console.log('error was found: ' + err);
      } else { 
          if (response) {
            // console.log(response)
            res.send(JSON.stringify({given: response.getTimesList()}))
        }
      }
  })

};





// function main() {
//     var client = new services.AutoTimetablerClient(
//         'localhost:9995', grpc.credentials.createInsecure());
//     var autoTimetableRequest = new messages.TimetableConstraints();
//     autoTimetableRequest.setStart(data['start']);
//     autoTimetableRequest.setEnd(data['end']); 
//     autoTimetableRequest.setDays(data['days']); 
//     autoTimetableRequest.setGap(data['gap']); 
//     autoTimetableRequest.setMaxdays(data['max']);
//     autoTimetableRequest.setPeriodsListSerialized(data['periods_list_serialized'])
//     client.findBestTimetable(autoTimetableRequest, (err, res) => {
//         if (err) {
//             console.log('error was found: ' + err);
//         } else { 
//             const times = res.getTimesList()
//             days = ['na', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
//             if (res) {
//             const courses = ['course1', 'course2', 'course3']
//             console.log(times.map((time, i) => courses[i] + ': ' + days[Math.floor(time / 100)] + ' ' + ((time % 100) / 2).toString()))
//           }
//         }
//     })


// }