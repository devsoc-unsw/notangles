import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class user {
    @Prop({ required: true }) uid: string;
    @Prop({ required: true }) google_uid: string;
    @Prop({ required: true }) zid: string;
    @Prop({ required: true }) firstname: string;
    @Prop({ required: false }) lastname: string;
    @Prop({ required: true }) email: string;
    @Prop({ required: false }) profileURL: string;
    @Prop({ required: false }) createdAt: Date;
    @Prop({ required: false }) lastLogin: Date;
    @Prop({ required: false }) loggedIn: Boolean;
    @Prop({ required: false }) settings: string;
    @Prop({ required: false }) timetable: string
}

export type userDocument = user & Document;
export const userSchema = SchemaFactory.createForClass(user);
export interface userInterface {
    uid: string;
    google_uid: string;
    zid: string;
    firstname: string;
    lastname?: string;
    email: string;
    profileURL?: string;
    createdAt?: Date;
    lastLogin?: Date;
    loggedIn?: Boolean;
    settings?: string;
    timetable?: string
}