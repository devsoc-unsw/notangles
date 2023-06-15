import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, CourseCode } from '../../interfaces/Periods';
import { DroppedCardsProps } from '../../interfaces/PropTypes';
import { findClashes, getClashInfo } from '../../utils/clashes';
import { ClassCard, morphCards } from '../../utils/Drag';
import DroppedClass from './DroppedClass';
import DroppedEvent from './DroppedEvent';

const DroppedCards: React.FC<DroppedCardsProps> = ({ assignedColors, handleSelectClass, setCopiedEvent, copiedEvent }) => {
  const [cardKeys] = useState<Map<ClassCard, number>>(new Map<ClassCard, number>());
  const [cellWidth, setCellWidth] = useState(0);

  const { isHideExamClasses, days, setErrorVisibility, setAlertMsg } = useContext(AppContext);
  const { selectedCourses, selectedClasses, createdEvents } = useContext(CourseContext);

  const droppedClasses: JSX.Element[] = [];
  const droppedEvents: JSX.Element[] = [];

  const prevClassCards = useRef<ClassCard[]>([]);
  const classCards: ClassCard[] = [];

  const keyCounter = useRef(0);
  const inventoryCards = useRef<ClassCard[]>([]);

  const droppedCardsRef = useRef<HTMLDivElement>(null);

  /**
   * @param courseCode The course code of the activity
   * @param activity The activity
   * @returns The inventory period corresponding to that activity
   */
  const getInventoryPeriod = (courseCode: CourseCode, activity: Activity) =>
    selectedCourses.find((course) => course.code === courseCode)?.inventoryData[activity];

  // Get all scheduled and unscheduled periods
  Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
    Object.entries(activities).forEach(([activity, classData]) => {
      if (isHideExamClasses && activity === 'Exam') return;

      if (classData) {
        // The current period is a scheduled
        classData.periods.forEach((classPeriod) => {
          classCards.push(classPeriod);
        });
      } else {
        // The current period is in the inventory
        const inventoryPeriod = getInventoryPeriod(courseCode, activity);
        if (inventoryPeriod) {
          classCards.push(inventoryPeriod);

          if (!inventoryCards.current.includes(inventoryPeriod)) {
            inventoryCards.current.push(inventoryPeriod);
          }
        }
      }
    });
  });

  // Clear any inventory cards which no longer exist
  inventoryCards.current = inventoryCards.current.filter((card) => classCards.includes(card));

  const prevCardKeys = new Map(cardKeys);
  morphCards(prevClassCards.current, classCards).forEach((morphCard, i) => {
    const prevCard = prevClassCards.current[i];

    if (morphCard && morphCard !== prevCard) {
      const cardKey = prevCardKeys.get(prevCard);

      if (cardKey) {
        cardKeys.set(morphCard as ClassCard, cardKey);
      }
    }
  });

  prevClassCards.current = [...classCards];

  // Handles getting width of a cell in the grid
  useLayoutEffect(() => {
    /**
     * Updates the computed width of each cell on the grid as the size of the timetable changes
     */
    const updateCellWidth = () => {
      if (droppedCardsRef.current) {
        const gridChildren = (droppedCardsRef.current as unknown as HTMLDivElement).parentElement?.children;

        if (gridChildren) {
          setCellWidth(gridChildren[Math.floor(gridChildren.length / 2)].getBoundingClientRect().width);
        }
      }
    };

    window.addEventListener('resize', updateCellWidth);
    updateCellWidth();

    return () => window.removeEventListener('resize', updateCellWidth);
  }, [days]);

  const clashes = findClashes(selectedClasses, createdEvents);

  // Generate classes
  classCards.forEach((classCard) => {
    try {
      let key = cardKeys.get(classCard);
      key = key !== undefined ? key : ++keyCounter.current;
      const [cardWidth, clashIndex, clashColour] = getClashInfo(clashes, classCard);

      droppedClasses.push(
        <DroppedClass
          key={key}
          classCard={classCard}
          color={assignedColors[classCard.courseCode]}
          y={classCard.type === 'inventory' ? inventoryCards.current.indexOf(classCard) : undefined}
          handleSelectClass={handleSelectClass}
          cardWidth={cardWidth as number}
          clashIndex={clashIndex as number}
          clashColour={clashColour as string}
          cellWidth={cellWidth}
          setCopiedEvent={setCopiedEvent}
          copiedEvent={copiedEvent}
        />
      );
      cardKeys.set(classCard, key);
    } catch (err) {
      setAlertMsg(unknownErrorMessage);
      setErrorVisibility(true);
    }
  });

  // Sort classes by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (a.key && b.key ? Number(a.key) - Number(b.key) : 0));

  // Clear any cards which no longer exist
  cardKeys.forEach((_, classCard) => {
    if (!classCards.includes(classCard)) cardKeys.delete(classCard);
  });

  // Generate events
  Object.entries(createdEvents).forEach(([key, eventPeriod]) => {
    try {
      const [cardWidth, clashIndex, _] = getClashInfo(clashes, eventPeriod);
      droppedEvents.push(
        <DroppedEvent
          key={key}
          eventId={key}
          eventPeriod={eventPeriod}
          cardWidth={cardWidth as number}
          clashIndex={clashIndex as number}
          cellWidth={cellWidth}
          setCopiedEvent={setCopiedEvent}
          copiedEvent={copiedEvent}
        />
      );
    } catch (err) {
      setAlertMsg(unknownErrorMessage);
      setErrorVisibility(true);
    }
  });

  return (
    // TODO Fix CSSTransition please
    // <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
    // </CSSTransition>
    <div style={{ display: 'contents' }} ref={droppedCardsRef}>
      {droppedClasses}
      {droppedEvents}
    </div>
  );
};

export default DroppedCards;
