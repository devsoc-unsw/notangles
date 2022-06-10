import React, { useContext, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { defaultStartTime } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassPeriod, ClassTime, CourseCode } from '../../interfaces/Course';
import { DroppedClassesProps } from '../../interfaces/PropTypes';
import { CardData, isPeriod, morphCards, transitionTime } from '../../utils/Drag';
import DroppedClass, { transitionName } from './DroppedClass';

const DroppedClasses: React.FC<DroppedClassesProps> = ({ assignedColors, handleSelectClass }) => {
  const [cardKeys] = useState<Map<CardData, number>>(new Map<CardData, number>());

  const days = useContext(AppContext).days;
  const { selectedCourses, selectedClasses } = useContext(CourseContext);

  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];

  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

  const earliestStartTime = Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime);

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

  // clear any inventory cards which no longer exist
  inventoryCards.current = inventoryCards.current.filter((card) => newCards.includes(card));

  const prevCardKeys = new Map(cardKeys);

  morphCards(prevCards.current, newCards).forEach((morphCard, i) => {
    const prevCard = prevCards.current[i];

    if (morphCard && morphCard !== prevCard) {
      const cardKey = prevCardKeys.get(prevCard);

      if (cardKey) {
        cardKeys.set(morphCard, cardKey);
      }
    }
  });

  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) =>
    period1.day === period2.day &&
    ((period1.end > period2.start && period1.start < period2.end) ||
      (period2.end > period1.start && period2.start < period1.end));

  const checkClashes = () => {
    const newClashes: ClassPeriod[] = [];
    let currSelectedClasses = Object.values(selectedClasses);
    if (currSelectedClasses !== null) {
      const flatPeriods = currSelectedClasses
        .flatMap((activities) => Object.values(activities))
        .flatMap((classData) => (classData ? classData.periods : []));

      flatPeriods.forEach((period1) => {
        flatPeriods.forEach((period2) => {
          if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
            if (!newClashes.includes(period1)) {
              newClashes.push(period1);
            }
            if (!newClashes.includes(period2)) {
              newClashes.push(period2);
            }
          }
        });
      });
    }
    return newClashes;
  };

  // Sort clashes by start time, if same start time, the clash with the earlier
  // end time will come first.
  const sortClashesByTime = (clashes: Record<number, ClassPeriod[]>) => {
    for (let i = 0; i < days.length; i++) {
      clashes[i].sort((a, b) => {
        let startDiff = a.time.start - b.time.start;
        if (startDiff !== 0) return startDiff;
        return a.time.end - b.time.end;
      });
    }
    return clashes;
  };

  // Group clashes according to the days of the week they are in.
  const sortClashesByDay = (clashes: ClassPeriod[]) => {
    const sortedClashes: Record<number, ClassPeriod[]> = days.map((_) => []);
    clashes.forEach((clash) => sortedClashes[clash.time.day - 1].push(clash));

    return sortClashesByTime(sortedClashes);
  };

  const groupClashes = (sortedClashes: Record<number, ClassPeriod[]>) => {
    // Clashes in each day are further separated according to how many classes
    // a single clash affects so each card can later be split accordingly.
    const groupedClashes: Record<number, ClassPeriod[][]> = days.map((_) => []);

    Object.entries(sortedClashes).forEach(([day, clashes]) => {
      const dayInt = parseInt(day);
      for (const clash of clashes) {
        if (groupedClashes[dayInt].length === 0) {
          // If there are no clashes in a day,
          // add a new list of clashes with just that class
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

  const getCardWidth = (groupedClashes: Record<number, ClassPeriod[][]>, cardData: CardData) => {
    // Returns the card width of a clashing class by dividing the default width of a card with how many
    // clashes there are happening during that time.
    let cardWidth = 100;
    let clashIndex = 0;

    if ('time' in cardData) {
      for (const clashGroup of groupedClashes[cardData.time.day - 1]) {
        if (clashGroup.includes(cardData)) {
          // Get the length of the clash group according to the unique clash IDs.
          let uniqueClashIDs: string[] = [];
          clashGroup.forEach((clash) => {
            if (!uniqueClashIDs.includes(clash.class.id)) {
              uniqueClashIDs.push(clash.class.id);
            }
          });
          return [cardWidth / uniqueClashIDs.length, uniqueClashIDs.indexOf(cardData.class.id)];
        }
      }
    }

    return [cardWidth, clashIndex];
  };

  const clashes = checkClashes();
  const sortedClashes = sortClashesByDay(clashes);
  const groupedClashes = groupClashes(sortedClashes);

  newCards.forEach((cardData) => {
    let key = cardKeys.get(cardData);
    key = key !== undefined ? key : ++keyCounter.current;

    let [cardWidth, clashIndex] = getCardWidth(groupedClashes, cardData);

    droppedClasses.push(
      <DroppedClass
        key={`${key}`}
        cardData={cardData}
        color={assignedColors[cardData.class.course.code]}
        y={!isPeriod(cardData) ? inventoryCards.current.indexOf(cardData) : undefined}
        earliestStartTime={earliestStartTime}
        hasClash={isPeriod(cardData) ? clashes.includes(cardData) : false}
        cardWidth={cardWidth}
        clashIndex={clashIndex}
        handleSelectClass={handleSelectClass}
        groupedClashes={groupedClashes}
      />
    );

    cardKeys.set(cardData, key);
  });

  // shallow copy
  prevCards.current = [...newCards];

  // sort by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (a.key && b.key ? Number(a.key) - Number(b.key) : 0));

  cardKeys.forEach((_, cardData) => {
    if (!newCards.includes(cardData)) {
      cardKeys.delete(cardData);
    }
  });

  return (
    <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
      <>{droppedClasses}</>
    </CSSTransition>
  );
};

export default DroppedClasses;
