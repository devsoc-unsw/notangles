import { CreatedEvents } from '../interfaces/Periods';
import { EventPeriod } from '../interfaces/Periods';
import { createEventObj } from './createEvent';

/**
 * Updates copiedEvent to match the cell double clicked on
 * @param e
 * @param copiedEvent
 * @param setCopiedEvent
 * @param day
 * @param startTime
 * @param setContextMenu
 */
export const handleContextMenu = (
  e: React.MouseEvent<HTMLElement>,
  copiedEvent: EventPeriod | null,
  setCopiedEvent: (copiedEvent: EventPeriod | null) => void,
  day: number,
  startTime: number,
  setContextMenu: (contextMenu: null | { x: number; y: number }) => void
) => {
  e.preventDefault();
  setContextMenu({ x: e.clientX, y: e.clientY });

  if (copiedEvent) {
    const copyCopiedEvent = copiedEvent;
    const eventTimeLength = copiedEvent.time.end - copiedEvent.time.start;
    const startOffset = copyCopiedEvent.time.start % 1;

    copyCopiedEvent.time.day = day;
    copyCopiedEvent.time.start = Math.floor(startTime) + startOffset;
    copyCopiedEvent.time.end = Math.floor(startTime) + startOffset + eventTimeLength;

    setCopiedEvent(copyCopiedEvent);
  }
};

/**
 * Creates a new event that is a copy of the event details stored in copiedEvent
 * Updates copiedEvent to match the cell double clicked on
 * @param copiedEvent
 * @param setContextMenu
 * @param createdEvents
 * @param setCreatedEvents
 */
export const handlePasteEvent = (
  copiedEvent: EventPeriod | null,
  setContextMenu: (contextMenu: null | { x: number; y: number }) => void,
  createdEvents: CreatedEvents,
  setCreatedEvents: (createdEvents: CreatedEvents) => void
) => {
  if (!copiedEvent) return;

  const newEvent = createEventObj(
    copiedEvent.event.name,
    copiedEvent.event.location,
    copiedEvent.event.description,
    copiedEvent.event.color,
    copiedEvent.time.day + 1,
    copiedEvent.time.start,
    copiedEvent.time.end
  );
  setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
  setContextMenu(null);
};
