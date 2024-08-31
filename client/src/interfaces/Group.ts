export enum Privacy {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: Privacy;
  timetableIDs: string[];
  memberIDs: string[];
  groupAdminIDs: string[];
  imageURL: string;
}
