import { User } from "../components/sidebar/UserAccount";
import { TimetableData } from "./Periods";

export enum Privacy {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: Privacy;
  timetables: TimetableData[];
  members: User[];
  groupAdmins: User[];
  imageURL: string;
}
