// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var autotimetabler_pb = require('./autotimetabler_pb.js');

function serialize_autotimetabler_AutoTimetableResponse(arg) {
  if (!(arg instanceof autotimetabler_pb.AutoTimetableResponse)) {
    throw new Error('Expected argument of type autotimetabler.AutoTimetableResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_autotimetabler_AutoTimetableResponse(buffer_arg) {
  return autotimetabler_pb.AutoTimetableResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_autotimetabler_TimetableConstraints(arg) {
  if (!(arg instanceof autotimetabler_pb.TimetableConstraints)) {
    throw new Error('Expected argument of type autotimetabler.TimetableConstraints');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_autotimetabler_TimetableConstraints(buffer_arg) {
  return autotimetabler_pb.TimetableConstraints.deserializeBinary(new Uint8Array(buffer_arg));
}


var AutoTimetablerService = exports.AutoTimetablerService = {
  findBestTimetable: {
    path: '/autotimetabler.AutoTimetabler/FindBestTimetable',
    requestStream: false,
    responseStream: false,
    requestType: autotimetabler_pb.TimetableConstraints,
    responseType: autotimetabler_pb.AutoTimetableResponse,
    requestSerialize: serialize_autotimetabler_TimetableConstraints,
    requestDeserialize: deserialize_autotimetabler_TimetableConstraints,
    responseSerialize: serialize_autotimetabler_AutoTimetableResponse,
    responseDeserialize: deserialize_autotimetabler_AutoTimetableResponse,
  },
};

exports.AutoTimetablerClient = grpc.makeGenericClientConstructor(AutoTimetablerService, 'AutoTimetabler');
