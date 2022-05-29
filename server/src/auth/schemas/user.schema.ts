import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class user {
  // @Prop({ required: true }) uid: string;
  @Prop() google_uid: string;
  // @Prop({ required: true }) zid: string;
  @Prop() firstname: string;
  @Prop() lastname: string;
  @Prop() email: string;
  @Prop() profileURL: string;
  @Prop() createdAt: Date;
  @Prop() lastLogin: Date;
  @Prop() loggedIn: Boolean;
  @Prop() settings: string;
  @Prop() timetable: string;
}

export type userDocument = user & Document;
export const userSchema = SchemaFactory.createForClass(user);
export interface userInterface {
  // uid: string;
  google_uid: string;
  // zid: string;
  firstname: string;
  lastname?: string;
  email: string;
  profileURL?: string;
  createdAt?: Date;
  lastLogin?: Date;
  loggedIn?: Boolean;
  settings?: string;
  timetable?: string;
}
