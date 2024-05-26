export class CreateGroupDto {
  name: string;
  description?: string;
  imageURL?: string;
  visibility?: string;
  timetableIDs: string[];
  memberIDs: string[];
  groupAdminIDs: string[];
}
