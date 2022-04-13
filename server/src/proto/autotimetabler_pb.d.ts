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
    getPeriodsListSerialized(): string;
    setPeriodsListSerialized(value: string): TimetableConstraints;

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
        periodsListSerialized: string,
    }
}

export class AutoTimetableResponse extends jspb.Message { 
    clearTimesList(): void;
    getTimesList(): Array<number>;
    setTimesList(value: Array<number>): AutoTimetableResponse;
    addTimes(value: number, index?: number): number;

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
    }
}
