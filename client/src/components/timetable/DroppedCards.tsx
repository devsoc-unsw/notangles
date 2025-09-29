import React, { type JSX, useContext, useLayoutEffect, useRef, useState } from 'react';

import { useGetClassesActivityByClassIds, useGetDistinctActivitiesForCourse } from '../../api/graphql/queries';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { decodeColor } from '../../hooks/useColorDecoder';
// import { Activity, CourseCode, InventoryPeriod } from '../../interfaces/Periods';
import { DroppedCardsProps } from '../../interfaces/PropTypes';
import { ClassData, InventoryPeriod } from '../../interfaces/Timetable';
import { findClashes, getClashInfo } from '../../utils/clashes';
import { ClassCard, morphCards } from '../../utils/Drag';
import DroppedClass from './DroppedClass';
import DroppedEvent from './DroppedEvent';

const DroppedCards: React.FC<DroppedCardsProps> = ({
  assignedColors,
  courseActivities,
  handleSelectClass,
  setCopiedEvent,
  copiedEvent,
}) => {
  const [cardKeys] = useState<Map<ClassCard, number>>(new Map<ClassCard, number>());
  const [cellWidth, setCellWidth] = useState(0);

  const { hideExamClasses, preferredTheme } = useGetUserSettingsQuery();
  const { days, setErrorVisibility, setAlertMsg } = useContext(AppContext);
  const { selectedClasses, createdEvents } = useContext(CourseContext);

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
  // const getInventoryPeriod = (courseCode: CourseCode, activity: Activity) =>
  //   selectedCourses.find((course) => course.code === courseCode)?.inventoryData[activity];

  // // Get all scheduled and unscheduled periods
  // Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
  //   Object.entries(activities).forEach(([activity, classData]) => {
  //     if (hideExamClasses && activity === 'Exam') return;

  //     if (classData) {
  //       // The current period is a scheduled
  //       classData.periods.forEach((classPeriod) => {
  //         classCards.push(classPeriod);
  //       });
  //     } else {
  //       // The current period is in the inventory
  //       const inventoryPeriod = getInventoryPeriod(courseCode, activity);
  //       if (inventoryPeriod) {
  //         classCards.push(inventoryPeriod);

  //         if (!inventoryCards.current.includes(inventoryPeriod)) {
  //           inventoryCards.current.push(inventoryPeriod);
  //         }
  //       }
  //     }
  //   });
  // });

  // const prevCardKeys = new Map(cardKeys);
  // morphCards(prevClassCards.current, classCards).forEach((morphCard, i) => {
  //   const prevCard = prevClassCards.current[i];

  //   if (morphCard && morphCard !== prevCard) {
  //     const cardKey = prevCardKeys.get(prevCard);

  //     if (cardKey) {
  //       cardKeys.set(morphCard as ClassCard, cardKey);
  //     }
  //   }
  // });

  // prevClassCards.current = [...classCards];

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
  }, [days]);

  const clashes = findClashes(selectedClasses, createdEvents);

  const { selectedCourses, term } = useContext(AppContext);
  const courseIds = Object.keys(selectedCourses);
  console.log('DroppedCards - courseActivities:', courseActivities);
  const classCardDataMap = new Map<ClassCard, ClassData>();
  // For each course, get all selected classes
  courseIds.forEach((courseId) => {
    if (courseId in courseActivities) {
      const selectedClassIds = selectedCourses[courseId].classIds;
      const remainingActivities = new Set<string>();
      Object.keys(courseActivities[courseId]).forEach((activity) => {
        courseActivities[courseId][activity].forEach((classData) => {
          if (selectedClassIds.includes(classData.id)) {
            // If this class is selected, remove the activity from remainingActivities
            if (remainingActivities.has(activity)) remainingActivities.delete(activity);
            // Add the selected class to classCards as ClassPeriod
            classData.periods.forEach((classPeriod) => {
              classCards.push(classPeriod);
              classCardDataMap.set(classPeriod, classData);
            });
          } else {
            // If this class is not selected, add the activity to remainingActivities
            remainingActivities.add(activity);
          }
        });
      });
      // Add the remaining activities to classCards as InventoryPeriod
      remainingActivities.forEach((activity) => {
        const inventoryPeriod: InventoryPeriod = {
          type: 'inventory',
          courseId: courseId,
          activity: activity,
          numberClass: Math.max(...courseActivities[courseId][activity].map((classData) => classData.periods.length)),
        };
        classCards.push(inventoryPeriod);
        if (!inventoryCards.current.includes(inventoryPeriod)) {
          inventoryCards.current.push(inventoryPeriod);
        }
      });
    }
  });

  // Clear any inventory cards which no longer exist
  inventoryCards.current = inventoryCards.current.filter((card) => classCards.includes(card));

  // Generate classes
  classCards.forEach((classCard) => {
    try {
      let key = cardKeys.get(classCard);
      key = key ?? ++keyCounter.current;
      const [cardWidth, clashIndex, clashColour] = getClashInfo(clashes, classCard);
      const currClassData = classCardDataMap.get(classCard);

      droppedClasses.push(
        <DroppedClass
          key={key}
          classCard={classCard}
          classData={currClassData}
          color={classCard.courseId ? decodeColor(selectedCourses[classCard.courseId].color, preferredTheme) : '#999'}
          y={classCard.type === 'inventory' ? inventoryCards.current.indexOf(classCard) : undefined}
          handleSelectClass={handleSelectClass}
          cardWidth={cardWidth as number}
          clashIndex={clashIndex as number}
          clashColour={clashColour as string}
          cellWidth={cellWidth}
          setCopiedEvent={setCopiedEvent}
          copiedEvent={copiedEvent}
        />,
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

  console.log('Class Cards', classCards);
  console.log('Dropped Classes', droppedClasses);
  console.log('Inventory Cards', inventoryCards.current);
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
        />,
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
