import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassPeriod, ClassTime, CourseCode } from '../../interfaces/Periods';
import { DroppedClassesProps } from '../../interfaces/PropTypes';
import { ClassCard, morphCards, transitionTime } from '../../utils/Drag';
import DroppedClass, { transitionName } from './DroppedClass';

const DroppedClasses: React.FC<DroppedClassesProps> = ({ assignedColors, handleSelectClass }) => {
  const [cardKeys] = useState<Map<ClassCard, number>>(new Map<ClassCard, number>());

  const { days } = useContext(AppContext);
  const { selectedCourses, selectedClasses } = useContext(CourseContext);
  const { earliestStartTime } = useContext(AppContext);

  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<ClassCard[]>([]);
  const newCards: ClassCard[] = [];

  const keyCounter = useRef(0);
  const inventoryCards = useRef<ClassCard[]>([]);

  const getInventoryPeriod = (courseCode: CourseCode, activity: Activity) =>
    selectedCourses.find((course) => course.code === courseCode)?.inventoryData[activity];

  Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
    Object.entries(activities).forEach(([activity, classData]) => {
      if (classData) {
        classData.periods.forEach((classPeriod) => {
          newCards.push(classPeriod);
        });
      } else {
        // in inventory
        const inventoryPeriod = getInventoryPeriod(courseCode, activity);
        if (inventoryPeriod) {
          newCards.push(inventoryPeriod);

          if (!inventoryCards.current.includes(inventoryPeriod)) {
            inventoryCards.current.push(inventoryPeriod);
          }
        }
      }
    });
  });

  // Clear any inventory cards which no longer exist
  inventoryCards.current = inventoryCards.current.filter((card) => newCards.includes(card));

  const prevCardKeys = new Map(cardKeys);

  morphCards(prevCards.current, newCards).forEach((morphCard, i) => {
    const prevCard = prevCards.current[i];

    if (morphCard && morphCard !== prevCard) {
      const cardKey = prevCardKeys.get(prevCard);

      if (cardKey) {
        cardKeys.set(morphCard as ClassCard, cardKey);
      }
    }
  });

  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) =>
    period1.day === period2.day &&
    ((period1.end > period2.start && period1.start < period2.end) ||
      (period2.end > period1.start && period2.start < period1.end));

  const getClashes = () => {
    const clashes: Set<ClassPeriod> = new Set();
    let currSelectedClasses = Object.values(selectedClasses);
    if (currSelectedClasses !== null) {
      const flatPeriods = currSelectedClasses
        .flatMap((activities) => Object.values(activities))
        .flatMap((classData) => (classData ? classData.periods : []));

      flatPeriods.forEach((period1) => {
        flatPeriods.forEach((period2) => {
          if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
            clashes.add(period1);
            clashes.add(period2);
          }
        });
      });
    }

    return Array.from(clashes);
  };

  // Sort clashes by start time. If two clahes have the same start time,
  // the clash with the earlier end time will come first.
  const sortClashesByTime = (clashDays: Record<number, ClassPeriod[]>) => {
    for (const clashDay of Object.values(clashDays)) {
      clashDay.sort((a, b) => {
        const startDiff = a.time.start - b.time.start;
        if (startDiff !== 0) return startDiff;
        return a.time.end - b.time.end;
      });
    }

    return clashDays;
  };

  // Group clashes according to the days of the week they are in.
  const sortClashesByDay = (clashes: ClassPeriod[]) => {
    const clashDays: Record<number, ClassPeriod[]> = days.map((_) => []);
    clashes.forEach((clash) => clashDays[clash.time.day - 1].push(clash));

    return sortClashesByTime(clashDays);
  };

  const groupClashes = (sortedClashes: Record<number, ClassPeriod[]>) => {
    const groupedClashes: Record<number, ClassPeriod[][]> = days.map((_) => []);

    Object.entries(sortedClashes).forEach(([day, clashes]) => {
      const dayInt = parseInt(day);
      for (const clash of clashes) {
        if (groupedClashes[dayInt].length === 0) {
          // If there are no clashes in a day, add a new list of clashes with just that class
          groupedClashes[dayInt].push([clash]);
        } else {
          let hasAdded = false;

          for (let i = 0; i < groupedClashes[dayInt].length; i++) {
            const currGroup = groupedClashes[dayInt][i];
            // Clash occurs for two classes A and B when
            // (StartA < EndB) and (EndA > StartB)
            if (clash.time.start < currGroup[currGroup.length - 1].time.end && clash.time.end > currGroup[0].time.start) {
              currGroup.push(clash);
              hasAdded = true;
            }
          }

          // If we haven't added the clash to any clashes list, add it to its own list of clashes as it
          // means that it will be a part of a new group of clashes (no other classes that we have grouped
          // have happened at the same time yet).
          if (!hasAdded) {
            groupedClashes[dayInt].push([clash]);
          }
        }
      }
    });

    return groupedClashes;
  };

  const getClashInfo = (groupedClashes: Record<number, ClassPeriod[][]>, classCard: ClassCard) => {
    let cardWidth = 100;
    let clashIndex = 0;
    let clashColour = 'orange';

    const defaultValues = [cardWidth, clashIndex, 'transparent'];

    if ('time' in classCard) {
      const clashGroup = groupedClashes[classCard.time.day - 1].find((group) => group.includes(classCard));
      if (!clashGroup) return defaultValues;

      // Get the length of the clash group according to the unique clash IDs.
      let uniqueClashIDs: string[] = [];
      let nonLecturePeriods: Set<string> = new Set();
      let isOverlapped = false;

      clashGroup.forEach((clash) => {
        if (!uniqueClashIDs.includes(clash.class.id)) {
          uniqueClashIDs.push(clash.class.id);
        }

        if (!clash.class.activity.includes('Lecture')) {
          nonLecturePeriods.add(clash.class.id);
        }

        // Check if the current classCard has weeks that are overlapping with
        // the weeks of the current clash.
        // This is so that two classes with clashing time but different weeks
        // are not supposed to clash (no border).
        const hasOverlappingWeeks = classCard.time.weeks.some((week) => clash.time.weeks.indexOf(week) !== -1);

        if (hasOverlappingWeeks && clash.class.id !== classCard.class.id) {
          isOverlapped = true;
        }
      });

      if (nonLecturePeriods.size > 1) {
        clashColour = 'red';
      } else if (!isOverlapped) {
        clashColour = 'transparent';
      }

      return [cardWidth / uniqueClashIDs.length, uniqueClashIDs.indexOf(classCard.class.id), clashColour];
    }

    return defaultValues;
  };

  // handles getting width of a cell in the grid
  const myRef = React.useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(0);
  useLayoutEffect(() => {
    const updateCellWidth = () => {
      if (myRef.current) {
        const gridChildren = (myRef.current as unknown as HTMLDivElement).parentElement?.children;

        if (gridChildren) {
          setCellWidth(gridChildren[Math.floor(gridChildren.length / 2)].getBoundingClientRect().width);
        }
      }
    };
    window.addEventListener('resize', updateCellWidth);
    updateCellWidth();
    return () => window.removeEventListener('resize', updateCellWidth);
  }, []);

  const clashes = getClashes();
  const sortedClashes = sortClashesByDay(clashes);
  const groupedClashes = groupClashes(sortedClashes);

  newCards.forEach((classCard) => {
    let key = cardKeys.get(classCard);
    key = key !== undefined ? key : ++keyCounter.current;

    const [cardWidth, clashIndex, clashColour] = getClashInfo(groupedClashes, classCard);

    droppedClasses.push(
      <DroppedClass
        key={key}
        classCard={classCard}
        color={assignedColors[classCard.class.course.code]}
        y={classCard.type === 'inventory' ? inventoryCards.current.indexOf(classCard) : undefined}
        earliestStartTime={earliestStartTime}
        cardWidth={cardWidth as number}
        clashIndex={clashIndex as number}
        clashColour={clashColour as string}
        handleSelectClass={handleSelectClass}
        cellWidth={cellWidth}
      />
    );

    cardKeys.set(classCard, key);
  });

  prevCards.current = [...newCards];

  // Sort by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (a.key && b.key ? Number(a.key) - Number(b.key) : 0));

  cardKeys.forEach((_, classCard) => {
    if (!newCards.includes(classCard)) {
      cardKeys.delete(classCard);
    }
  });

  return (
    <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
      <div ref={myRef}>{droppedClasses}</div>
    </CSSTransition>
  );
};

export default DroppedClasses;
