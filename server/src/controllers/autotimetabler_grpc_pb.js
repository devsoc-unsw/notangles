// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var autotimetabler_pb = require('./autotimetabler_pb.js');

function serialize_AutoTimetableResponse(arg) {
  if (!(arg instanceof autotimetabler_pb.AutoTimetableResponse)) {
    throw new Error('Expected argument of type AutoTimetableResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_AutoTimetableResponse(buffer_arg) {
  return autotimetabler_pb.AutoTimetableResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_TimetableConstraints(arg) {
  if (!(arg instanceof autotimetabler_pb.TimetableConstraints)) {
    throw new Error('Expected argument of type TimetableConstraints');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_TimetableConstraints(buffer_arg) {
  return autotimetabler_pb.TimetableConstraints.deserializeBinary(new Uint8Array(buffer_arg));
}


var AutoTimetablerService = exports.AutoTimetablerService = {
  findBestTimetable: {
    path: '/AutoTimetabler/FindBestTimetable',
    requestStream: false,
    responseStream: false,
    requestType: autotimetabler_pb.TimetableConstraints,
    responseType: autotimetabler_pb.AutoTimetableResponse,
    requestSerialize: serialize_TimetableConstraints,
    requestDeserialize: deserialize_TimetableConstraints,
    responseSerialize: serialize_AutoTimetableResponse,
    responseDeserialize: deserialize_AutoTimetableResponse,
  },
};

exports.AutoTimetablerClient = grpc.makeGenericClientConstructor(AutoTimetablerService);
