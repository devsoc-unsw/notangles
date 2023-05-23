import { v4 as uuidv4 } from 'uuid';
import { ClassPeriod, EventPeriod } from '../interfaces/Periods';

/**
 * Returns an event object with all the event info
 * This was made to directly pass day, startTime, endTime for creating events via link
 * @param name
 * @param location
 * @param description
 * @param color
 * @param day
 * @param startTime
 * @param endTime
 * @returns EventPeriod object
 */
export const handleContextMenu = (e: React.MouseEvent<HTMLElement>, copiedEvent: EventPeriod | null, classPeriod: ClassPeriod,  setContextMenu: (contextMenu: null | { x: number; y: number }) => void) => {
    if (copiedEvent) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });

      //Update copied event to match the cell double clicked on
      const copyCopiedEvent = copiedEvent;
      const eventTimeLength = copiedEvent.time.end - copiedEvent.time.start;
      const startOffset = copyCopiedEvent.time.start % 1;

      copyCopiedEvent.time.day = classPeriod.time.day - 1;
      copyCopiedEvent.time.start = Math.floor(classPeriod.time.start) + startOffset;
      copyCopiedEvent.time.end = Math.floor(classPeriod.time.start) + startOffset + eventTimeLength;
    }
  };
