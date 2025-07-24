import { DisplayTimetablesMap } from '../../../interfaces/Periods';

export interface User {
  userID: string;
  firstname: string;
  lastname: string;
  email: string;
  profileURL: string;
  createdAt: string;
  lastLogin: string;
  loggedIn: boolean;
  friends: User[];
  incoming: User[];
  outgoing: User[];
  timetables: DisplayTimetablesMap;
}
