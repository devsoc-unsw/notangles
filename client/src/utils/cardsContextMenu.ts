import { ClassPeriod, EventPeriod } from '../interfaces/Periods';

/**
 * Updates copiedEvent to match the cell double clicked on
 * @param e
 * @param copiedEvent
 * @param day
 * @param startTime
 * @param setContextMenu
 */
export const handleContextMenu = (
  e: React.MouseEvent<HTMLElement>,
  copiedEvent: EventPeriod | null,
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
  }
};
