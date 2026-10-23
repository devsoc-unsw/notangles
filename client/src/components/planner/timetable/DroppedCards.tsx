import { useLayoutEffect, useRef, useState } from 'react';

import { EventCard } from '../../../interfaces/Timetable';
import DroppedEvent from './DroppedEvent';

// Measures how wide a grid cell currently is, and passes cellWidth through
// DroppedEvent so each card sits in the right spot on the timetable.
const DroppedCards: React.FC<{
  timetableId: string;
  numberOfDays: number;
  earliestStartHour: number;
  events: EventCard[];
  // Strictly used by FriendGrid to toggle see-only cards
  readOnly?: boolean;
  // Used by Timetable when the cards are editable
  eventCopied?: boolean;
  setCopiedEvent?: React.Dispatch<React.SetStateAction<EventCard | undefined>>;
  handlePasteEvent?: (
    pasteTime: { day: number; start: number; end: number },
    setContextMenu: React.Dispatch<React.SetStateAction<{ mouseX: number; mouseY: number } | null>>,
  ) => void;
}> = ({
  timetableId,
  numberOfDays,
  earliestStartHour,
  events,
  readOnly,
  eventCopied,
  setCopiedEvent,
  handlePasteEvent,
}) => {
  const droppedCardsRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState<number>(0);

  // Handles getting width of a cell in the grid
  useLayoutEffect(() => {
    /**
     * Updates the computed width of each cell on the grid as the size of the timetable changes
     */
    const droppedEl = droppedCardsRef.current;
    const gridParent = droppedEl?.parentElement;

    if (!gridParent) return;

    const updateCellWidth = () => {
      const gridChildren = gridParent.children;
      if (gridChildren.length > 0) {
        const sampleCell = gridChildren[Math.floor(gridChildren.length / 2)] as HTMLElement;
        setCellWidth(sampleCell.getBoundingClientRect().width);
      }
    };

    // Observe the parent element for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateCellWidth();
    });
    resizeObserver.observe(gridParent);
    updateCellWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [numberOfDays]);

  const droppedEvents = events.map((event) => (
    <DroppedEvent
      timetableId={timetableId}
      key={event.eventId}
      card={event}
      numberOfDays={numberOfDays}
      earliestStartHour={earliestStartHour}
      clashIndex={0}
      readOnly={readOnly}
      eventCopied={eventCopied}
      setCopiedEvent={setCopiedEvent}
      handlePasteEvent={handlePasteEvent}
      cardWidth={100}
      cellWidth={cellWidth}
    />
  ));

  return (
    // TODO: Do we need to fix CSSTransition? See DroppedCardStyles.tsx for this
    // <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
    // </CSSTransition>
    <div style={{ display: 'contents' }} ref={droppedCardsRef}>
      {/* TODO: droppedClasses */}
      {droppedEvents}
    </div>
  );
};

export default DroppedCards;
