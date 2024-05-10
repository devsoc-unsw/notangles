// package: 
// file: autotimetabler.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as autotimetabler_pb from "./autotimetabler_pb";

interface IAutoTimetablerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    findBestTimetable: IAutoTimetablerService_IFindBestTimetable;
}

interface IAutoTimetablerService_IFindBestTimetable extends grpc.MethodDefinition<autotimetabler_pb.TimetableConstraints, autotimetabler_pb.AutoTimetableResponse> {
    path: "/AutoTimetabler/FindBestTimetable";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<autotimetabler_pb.TimetableConstraints>;
    requestDeserialize: grpc.deserialize<autotimetabler_pb.TimetableConstraints>;
    responseSerialize: grpc.serialize<autotimetabler_pb.AutoTimetableResponse>;
    responseDeserialize: grpc.deserialize<autotimetabler_pb.AutoTimetableResponse>;
}

export const AutoTimetablerService: IAutoTimetablerService;

export interface IAutoTimetablerServer {
    findBestTimetable: grpc.handleUnaryCall<autotimetabler_pb.TimetableConstraints, autotimetabler_pb.AutoTimetableResponse>;
}

export interface IAutoTimetablerClient {
    findBestTimetable(request: autotimetabler_pb.TimetableConstraints, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
    findBestTimetable(request: autotimetabler_pb.TimetableConstraints, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
    findBestTimetable(request: autotimetabler_pb.TimetableConstraints, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
}

export class AutoTimetablerClient extends grpc.Client implements IAutoTimetablerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public findBestTimetable(request: autotimetabler_pb.TimetableConstraints, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
    public findBestTimetable(request: autotimetabler_pb.TimetableConstraints, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
    public findBestTimetable(request: autotimetabler_pb.TimetableConstraints, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: autotimetabler_pb.AutoTimetableResponse) => void): grpc.ClientUnaryCall;
}
