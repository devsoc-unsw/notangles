import { Alert, Snackbar } from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { EventCard } from '../../../interfaces/Timetable';
import ClassDropzones from './ClassDropzones';
import DroppedClass from './DroppedClass';
import DroppedEvent from './DroppedEvent';
import { useDroppedClasses } from './useDroppedClasses';

// Measures how wide a grid cell currently is, and passes cellWidth through
// DroppedEvent so each card sits in the right spot on the timetable.
const DroppedCards: React.FC<{
  timetableId: string;
  courses: TimetableCourse[];
  classes: TimetableClass[];
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
  courses,
  classes,
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

  const {
    cards,
    drag,
    dragging,
    dragColour,
    dropSlots,
    isSquareEdges,
    startDrag,
    registerDropzone,
    handleSelectClass,
    saveFailed,
    dismissSaveError,
  } = useDroppedClasses({ timetableId, courses, classes, numberOfDays, earliestStartHour });

  const droppedClasses = cards.map((card) => (
    <DroppedClass
      key={card.key}
      card={card}
      classes={classes}
      numberOfDays={numberOfDays}
      isSquareEdges={isSquareEdges}
      isElevated={dragging && drag?.source.courseId === card.courseId && drag.source.activity === card.activity}
      // Read-only cards can't be expanded or dragged, since both let you change the selected class
      canExpand={!readOnly && !drag}
      handleSelectClass={handleSelectClass}
      cardWidth={card.cardWidth}
      clashIndex={card.clashIndex}
      clashColour={card.clashColour}
      onPointerDown={
        !readOnly && card.draggable
          ? (event) => {
              startDrag(event, {
                cardKey: card.key,
                courseId: card.courseId,
                activity: card.activity,
                classId: card.classId,
                timeIndex: card.timeIndex,
              });
            }
          : undefined
      }
    />
  ));

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
      {droppedClasses}
      {droppedEvents}

      {dragging && (
        <ClassDropzones
          slots={dropSlots}
          target={drag?.target ?? null}
          numberOfDays={numberOfDays}
          earliestStartHour={earliestStartHour}
          backgroundColour={dragColour}
          isSquareEdges={isSquareEdges}
          registerDropzone={registerDropzone}
        />
      )}

      <Snackbar
        open={saveFailed}
        autoHideDuration={6000}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') dismissSaveError();
        }}
      >
        <Alert
          severity="error"
          onClose={() => {
            dismissSaveError();
          }}
        >
          Could not save your class selection. Please try again.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DroppedCards;
