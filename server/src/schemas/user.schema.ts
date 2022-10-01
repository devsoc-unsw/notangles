import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  EventsDto,
  UserSettingsDto,
  UserTimetablesDto,
} from 'src/user/dtos/user.dto';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  @Prop({ required: true })
  is12HourMode: boolean;

  @Prop({ required: true })
  isDarkMode: boolean;

  @Prop({ required: true })
  isSquareEdges: boolean;

  @Prop({ required: true })
  isHideFullClasses: boolean;

  @Prop({ required: true })
  isDefaultUnscheduled: boolean;

  @Prop({ required: true })
  isHideClassInfo: boolean;

  @Prop({ required: true })
  isSortAlphabetic: boolean;

  @Prop({ required: true })
  isShowOnlyOpenClasses: boolean;

  @Prop({ required: true })
  isHideExamClasses: boolean;

  @Prop({ required: true })
  isConvertToLocalTimezone: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(Settings);

export type TimetableDocument = Timetable & Document;

@Schema()
export class Timetable {
  @Prop({ unique: true, required: true })
  timetableId: string;

  @Prop([String])
  selectedCourses: string[];

  @Prop(
    raw({
      type: Map,
      of: raw({
        type: Map,
        of: String,
      }),
    }),
  )
  selectedClasses: Record<string, Record<string, string>>;

  @Prop([EventsDto])
  events: EventsDto[];
}

export const UserTimetableSchema = SchemaFactory.createForClass(Timetable);

@Schema()
export class User {
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
  @Prop([String]) friends: string[];
  @Prop({ type: UserSettingsDto }) settings: UserSettingsDto;
  @Prop([{ type: UserTimetablesDto }]) timetables: UserTimetablesDto[];
}

export const userSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;

export interface UserInterface {
  google_uid: string;
  firstname: string;
  lastname?: string;
  email: string;
  profileURL?: string;
  createdAt?: Date;
  lastLogin?: Date;
  loggedIn?: Boolean;
  friends: string[];
  settings: UserSettingsDto;
  timetables: UserTimetablesDto[];
}
