import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  @Prop({unique: true, required: true})
  userID: string;

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
  @Prop({unique: true, required: true })
  userID: string;

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