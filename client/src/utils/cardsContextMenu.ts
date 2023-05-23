import { ClassPeriod, EventPeriod } from '../interfaces/Periods';

/**
 * Updates copiedEvent to match the cell double clicked on
 * @param e
 * @param copiedEvent
 * @param classPeriod
 * @param setContextMenu
 */
export const handleContextMenu = (
  e: React.MouseEvent<HTMLElement>,
  copiedEvent: EventPeriod | null,
  classPeriod: ClassPeriod | EventPeriod,
  setContextMenu: (contextMenu: null | { x: number; y: number }) => void
) => {
  e.preventDefault();
  setContextMenu({ x: e.clientX, y: e.clientY });

  if (copiedEvent) {
    const copyCopiedEvent = copiedEvent;
    const eventTimeLength = copiedEvent.time.end - copiedEvent.time.start;
    const startOffset = copyCopiedEvent.time.start % 1;

    copyCopiedEvent.time.day = classPeriod.time.day - 1;
    copyCopiedEvent.time.start = Math.floor(classPeriod.time.start) + startOffset;
    copyCopiedEvent.time.end = Math.floor(classPeriod.time.start) + startOffset + eventTimeLength;
  }
};
