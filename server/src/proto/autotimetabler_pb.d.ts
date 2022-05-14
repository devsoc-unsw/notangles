// package: 
// file: autotimetabler.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class TimetableConstraints extends jspb.Message { 
    getStart(): number;
    setStart(value: number): TimetableConstraints;
    getEnd(): number;
    setEnd(value: number): TimetableConstraints;
    getDays(): string;
    setDays(value: string): TimetableConstraints;
    getGap(): number;
    setGap(value: number): TimetableConstraints;
    getMaxdays(): number;
    setMaxdays(value: number): TimetableConstraints;
    clearPeriodinfoList(): void;
    getPeriodinfoList(): Array<TimetableConstraints.PeriodInfo>;
    setPeriodinfoList(value: Array<TimetableConstraints.PeriodInfo>): TimetableConstraints;
    addPeriodinfo(value?: TimetableConstraints.PeriodInfo, index?: number): TimetableConstraints.PeriodInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TimetableConstraints.AsObject;
    static toObject(includeInstance: boolean, msg: TimetableConstraints): TimetableConstraints.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TimetableConstraints, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TimetableConstraints;
    static deserializeBinaryFromReader(message: TimetableConstraints, reader: jspb.BinaryReader): TimetableConstraints;
}

export namespace TimetableConstraints {
    export type AsObject = {
        start: number,
        end: number,
        days: string,
        gap: number,
        maxdays: number,
        periodinfoList: Array<TimetableConstraints.PeriodInfo.AsObject>,
    }


    export class PeriodInfo extends jspb.Message { 
        getPeriodsperclass(): number;
        setPeriodsperclass(value: number): PeriodInfo;
        clearPeriodtimesList(): void;
        getPeriodtimesList(): Array<number>;
        setPeriodtimesList(value: Array<number>): PeriodInfo;
        addPeriodtimes(value: number, index?: number): number;
        clearDurationsList(): void;
        getDurationsList(): Array<number>;
        setDurationsList(value: Array<number>): PeriodInfo;
        addDurations(value: number, index?: number): number;

        serializeBinary(): Uint8Array;
        toObject(includeInstance?: boolean): PeriodInfo.AsObject;
        static toObject(includeInstance: boolean, msg: PeriodInfo): PeriodInfo.AsObject;
        static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
        static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
        static serializeBinaryToWriter(message: PeriodInfo, writer: jspb.BinaryWriter): void;
        static deserializeBinary(bytes: Uint8Array): PeriodInfo;
        static deserializeBinaryFromReader(message: PeriodInfo, reader: jspb.BinaryReader): PeriodInfo;
    }

    export namespace PeriodInfo {
        export type AsObject = {
            periodsperclass: number,
            periodtimesList: Array<number>,
            durationsList: Array<number>,
        }
    }

}

export class AutoTimetableResponse extends jspb.Message { 
    clearTimesList(): void;
    getTimesList(): Array<number>;
    setTimesList(value: Array<number>): AutoTimetableResponse;
    addTimes(value: number, index?: number): number;
    getOptimal(): boolean;
    setOptimal(value: boolean): AutoTimetableResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AutoTimetableResponse.AsObject;
    static toObject(includeInstance: boolean, msg: AutoTimetableResponse): AutoTimetableResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AutoTimetableResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AutoTimetableResponse;
    static deserializeBinaryFromReader(message: AutoTimetableResponse, reader: jspb.BinaryReader): AutoTimetableResponse;
}

export namespace AutoTimetableResponse {
    export type AsObject = {
        timesList: Array<number>,
        optimal: boolean,
    }
}
