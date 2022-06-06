import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserSettingsDto, UserTimetableDataDto } from 'src/database/dtos/database.dto';



export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  // @Prop({unique: true, required: true})
  // userID: string;
  
  @Prop({unique: true, required: true})
  is12HourMode: boolean;

  @Prop({unique: true, required: true})
  isDarkMode: boolean;
  
  @Prop({unique: true, required: true})
  isSquareEdges: boolean;
  
  @Prop({unique: true, required: true})
  isHideFullClasses: boolean;
  
  @Prop({unique: true, required: true})
  isDefaultUnscheduled: boolean;
  
  @Prop({unique: true, required: true})
  isHideClassInfo: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(Settings);


export type TimetableDocument = Timetable & Document;

@Schema()
export class Timetable {
  // @Prop({unique: true, required: true })
  // userID: string;
  
  @Prop([String])
  selectedCourses: string[];
  
  
  @Prop(raw({
    type: Map,
    of: raw({
      type: Map,
      of: String
    })
  }))
  selectedClasses: Record<string, Record<string, string>>;
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

  @Prop({ type: UserSettingsSchema }) settings: UserSettingsDto;
  @Prop({ type: UserTimetableSchema }) timetable: UserTimetableDataDto;
}

export const userSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;

export interface UserInterface {
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
  settings: UserSettingsDto;
  timetable: UserTimetableDataDto;
}