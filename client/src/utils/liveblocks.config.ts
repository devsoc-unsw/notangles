import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const liveblocksClient = createClient({
  publicApiKey: 'pk_live_m1tiyyPZ108XbpzCjImrcocb',
});

export const { RoomProvider, useOthers } = createRoomContext(liveblocksClient);
