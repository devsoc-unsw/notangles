/* eslint-disable */
import * as Long from 'long';
import * as _m0 from 'protobufjs/minimal';

export const protobufPackage = '';

export class ClassTimetableConstraints implements TimetableConstraints  {
  start: number;
  end: number;
  days: string;
  gap: number;
  maxdays: number;
  periodInfo: TimetableConstraints_PeriodInfo[];
}

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

function createBaseTimetableConstraints(): TimetableConstraints {
  return { start: 0, end: 0, days: '', gap: 0, maxdays: 0, periodInfo: [] };
}

export const TimetableConstraints = {
  encode(
    message: TimetableConstraints,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.start !== 0) {
      writer.uint32(8).int32(message.start);
    }
    if (message.end !== 0) {
      writer.uint32(16).int32(message.end);
    }
    if (message.days !== '') {
      writer.uint32(26).string(message.days);
    }
    if (message.gap !== 0) {
      writer.uint32(32).int32(message.gap);
    }
    if (message.maxdays !== 0) {
      writer.uint32(40).int32(message.maxdays);
    }
    for (const v of message.periodInfo) {
      TimetableConstraints_PeriodInfo.encode(
        v!,
        writer.uint32(50).fork(),
      ).ldelim();
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TimetableConstraints {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimetableConstraints();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.start = reader.int32();
          break;
        case 2:
          message.end = reader.int32();
          break;
        case 3:
          message.days = reader.string();
          break;
        case 4:
          message.gap = reader.int32();
          break;
        case 5:
          message.maxdays = reader.int32();
          break;
        case 6:
          message.periodInfo.push(
            TimetableConstraints_PeriodInfo.decode(reader, reader.uint32()),
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TimetableConstraints {
    return {
      start: isSet(object.start) ? Number(object.start) : 0,
      end: isSet(object.end) ? Number(object.end) : 0,
      days: isSet(object.days) ? String(object.days) : '',
      gap: isSet(object.gap) ? Number(object.gap) : 0,
      maxdays: isSet(object.maxdays) ? Number(object.maxdays) : 0,
      periodInfo: Array.isArray(object?.periodInfo)
        ? object.periodInfo.map((e: any) =>
            TimetableConstraints_PeriodInfo.fromJSON(e),
          )
        : [],
    };
  },

  toJSON(message: TimetableConstraints): unknown {
    const obj: any = {};
    message.start !== undefined && (obj.start = Math.round(message.start));
    message.end !== undefined && (obj.end = Math.round(message.end));
    message.days !== undefined && (obj.days = message.days);
    message.gap !== undefined && (obj.gap = Math.round(message.gap));
    message.maxdays !== undefined &&
      (obj.maxdays = Math.round(message.maxdays));
    if (message.periodInfo) {
      obj.periodInfo = message.periodInfo.map((e) =>
        e ? TimetableConstraints_PeriodInfo.toJSON(e) : undefined,
      );
    } else {
      obj.periodInfo = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TimetableConstraints>, I>>(
    object: I,
  ): TimetableConstraints {
    const message = createBaseTimetableConstraints();
    message.start = object.start ?? 0;
    message.end = object.end ?? 0;
    message.days = object.days ?? '';
    message.gap = object.gap ?? 0;
    message.maxdays = object.maxdays ?? 0;
    message.periodInfo =
      object.periodInfo?.map((e) =>
        TimetableConstraints_PeriodInfo.fromPartial(e),
      ) || [];
    return message;
  },
};

function createBaseTimetableConstraints_PeriodInfo(): TimetableConstraints_PeriodInfo {
  return { periodsPerClass: 0, periodTimes: [], durations: [] };
}

export const TimetableConstraints_PeriodInfo = {
  encode(
    message: TimetableConstraints_PeriodInfo,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.periodsPerClass !== 0) {
      writer.uint32(8).int32(message.periodsPerClass);
    }
    writer.uint32(18).fork();
    for (const v of message.periodTimes) {
      writer.float(v);
    }
    writer.ldelim();
    writer.uint32(26).fork();
    for (const v of message.durations) {
      writer.float(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): TimetableConstraints_PeriodInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimetableConstraints_PeriodInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.periodsPerClass = reader.int32();
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.periodTimes.push(reader.float());
            }
          } else {
            message.periodTimes.push(reader.float());
          }
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.durations.push(reader.float());
            }
          } else {
            message.durations.push(reader.float());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TimetableConstraints_PeriodInfo {
    return {
      periodsPerClass: isSet(object.periodsPerClass)
        ? Number(object.periodsPerClass)
        : 0,
      periodTimes: Array.isArray(object?.periodTimes)
        ? object.periodTimes.map((e: any) => Number(e))
        : [],
      durations: Array.isArray(object?.durations)
        ? object.durations.map((e: any) => Number(e))
        : [],
    };
  },

  toJSON(message: TimetableConstraints_PeriodInfo): unknown {
    const obj: any = {};
    message.periodsPerClass !== undefined &&
      (obj.periodsPerClass = Math.round(message.periodsPerClass));
    if (message.periodTimes) {
      obj.periodTimes = message.periodTimes.map((e) => e);
    } else {
      obj.periodTimes = [];
    }
    if (message.durations) {
      obj.durations = message.durations.map((e) => e);
    } else {
      obj.durations = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<TimetableConstraints_PeriodInfo>, I>>(
    object: I,
  ): TimetableConstraints_PeriodInfo {
    const message = createBaseTimetableConstraints_PeriodInfo();
    message.periodsPerClass = object.periodsPerClass ?? 0;
    message.periodTimes = object.periodTimes?.map((e) => e) || [];
    message.durations = object.durations?.map((e) => e) || [];
    return message;
  },
};

function createBaseAutoTimetableResponse(): AutoTimetableResponse {
  return { times: [], optimal: false };
}

export const AutoTimetableResponse = {
  encode(
    message: AutoTimetableResponse,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.times) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.optimal === true) {
      writer.uint32(16).bool(message.optimal);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number,
  ): AutoTimetableResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAutoTimetableResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.times.push(reader.float());
            }
          } else {
            message.times.push(reader.float());
          }
          break;
        case 2:
          message.optimal = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AutoTimetableResponse {
    return {
      times: Array.isArray(object?.times)
        ? object.times.map((e: any) => Number(e))
        : [],
      optimal: isSet(object.optimal) ? Boolean(object.optimal) : false,
    };
  },

  toJSON(message: AutoTimetableResponse): unknown {
    const obj: any = {};
    if (message.times) {
      obj.times = message.times.map((e) => e);
    } else {
      obj.times = [];
    }
    message.optimal !== undefined && (obj.optimal = message.optimal);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AutoTimetableResponse>, I>>(
    object: I,
  ): AutoTimetableResponse {
    const message = createBaseAutoTimetableResponse();
    message.times = object.times?.map((e) => e) || [];
    message.optimal = object.optimal ?? false;
    return message;
  },
};

export interface AutoTimetabler {
  FindBestTimetable(
    request: TimetableConstraints,
  ): Promise<AutoTimetableResponse>;
}

export class AutoTimetablerClientImpl implements AutoTimetabler {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
    this.FindBestTimetable = this.FindBestTimetable.bind(this);
  }
  FindBestTimetable(
    request: TimetableConstraints,
  ): Promise<AutoTimetableResponse> {
    const data = TimetableConstraints.encode(request).finish();
    const promise = this.rpc.request(
      'AutoTimetabler',
      'FindBestTimetable',
      data,
    );
    return promise.then((data) =>
      AutoTimetableResponse.decode(new _m0.Reader(data)),
    );
  }
}

interface Rpc {
  request(
    service: string,
    method: string,
    data: Uint8Array,
  ): Promise<Uint8Array>;
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
