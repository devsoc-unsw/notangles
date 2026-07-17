export class ClassDetails {
  activity: string;
  section: string;
}

export class FreeRoomsResponse {
  buildings: {
    rooms: FreeRooms[];
  }[];
}

export class FreeRooms {
  id: string;
  name: string;
  abbr: string;
  capacity: number;
}
