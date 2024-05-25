export class UpdateGroupDto {
    readonly name?: string;
    readonly visibility?: string;
    readonly timetableIDs?: string[];
    readonly memberIDs?: string[];
    readonly groupAdmins?: string[];
    readonly groupImageURL?: string;
  }