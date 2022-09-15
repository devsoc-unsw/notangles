import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const liveblocksClient = createClient({
  publicApiKey: 'pk_live_m1tiyyPZ108XbpzCjImrcocb',
});

export const { RoomProvider, useOthers, useUpdateMyPresence, useRoom, useObject } = createRoomContext<{
  selectedCourses: any;
  selectedClasses: any;
  createdEvents: any;
  cursor: {
    x: number;
    y: number;
    label?: string;
  };
}>(liveblocksClient);
