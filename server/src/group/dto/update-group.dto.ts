export class UpdateGroupDto {
  name?: string;
  visibility?: string;
  timetableIDs?: string[];
  memberIDs?: string[];
  groupAdmins?: string[];
  groupImageURL?: string;
}
