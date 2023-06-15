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
    const copyCopiedEvent: EventPeriod = copiedEvent;
    const eventTimeLength: number = copiedEvent.time.end - copiedEvent.time.start;
    const startOffset: number = copyCopiedEvent.time.start % 1; // Get the floating point value, ie. the minutes
    const [start, end]: [number, number] = [
      Math.floor(startTime) + startOffset,
      Math.floor(startTime) + startOffset + eventTimeLength,
    ];

    copyCopiedEvent.time = {
      day,
      start,
      end,
    };

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
  const { name, location, description, color, day, start, end } = { ...copiedEvent.event, ...copiedEvent.time };
  const newEvent = createEventObj(name, location, description, color, day + 1, start, end);
  setCreatedEvents({ ...createdEvents, [newEvent.event.id]: newEvent });
  setContextMenu(null);
};
