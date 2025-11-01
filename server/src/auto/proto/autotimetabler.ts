/* Generated Code by ts-proto */
/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const protobufPackage = 'autotimetabler';

declare var self: any | undefined;
declare var window: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw new Error('Unable to locate global object');
})();

export interface TimetableConstraints {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodInfo: TimetableConstraints_PeriodInfo[];
}

export interface TimetableConstraints_PeriodInfo {
  periodsPerClass: number;
  periodTimes: number[];
  durations: number[];
}

export interface AutoTimetableResponse {
  times: number[];
  optimal: boolean;
}

export const AUTOTIMETABLER_PACKAGE_NAME = 'autotimetabler';

export interface AutoTimetablerClient {
  findBestTimetable(
    request: TimetableConstraints,
  ): Observable<AutoTimetableResponse>;
}

export interface AutoTimetablerController {
  findBestTimetable(
    request: TimetableConstraints,
  ):
    | Promise<AutoTimetableResponse>
    | Observable<AutoTimetableResponse>
    | AutoTimetableResponse;
}

export function AutoTimetablerControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods = ['findBestTimetable'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('AutoTimetabler', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: never[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('AutoTimetabler', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const AUTO_TIMETABLER_SERVICE_NAME = 'AutoTimetabler';
