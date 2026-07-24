export class ClassDetails {
  activity: string;
  section: string;
}

export class FreeRoomsResponse {
  buildings: {
    rooms: FreeRoom[];
  }[];
}

export class FreeRoom {
  id: string;
  name: string;
  abbr: string;
  capacity: number;
}
