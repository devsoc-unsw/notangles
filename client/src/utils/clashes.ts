import { daysLong } from '../constants/timetable';
// import {
//   ClassData,
//   ClassPeriod,
//   ClassTime,
//   CreatedEvents,
//   EventPeriod,
//   EventTime,
//   SelectedClasses,
// } from '../interfaces/Timetable';
import { ClassCardView } from '../components/planner/timetable/useDroppedClasses';

export interface ClashInfo {
  cardWidth: number;
  clashIndex: number;
  clashColour: string;
}

// Confluence docs regarding clashes: https://compclub.atlassian.net/wiki/spaces/N/pages/2227634185/Timetable+Clashes

// Calculating the card end time
const endTime = (card: ClassCardView) => (card.startMinutes ?? 0) + (card.durationMinutes ?? 0)

/**
 * @param period1 The first period
 * @param period2 The second period
 * @returns Whether the two periods overlap
 */
const hasTimeOverlap = (period1: ClassCardView, period2: ClassCardView) =>
  period1.dayIndex === period2.dayIndex && 
  (period1.startMinutes ?? 0) < endTime(period2) && (period2.startMinutes ?? 0) < endTime(period1);

/**
 * @param currSelectedClasses The currently selected classes
 * @returns A list of all the currently scheduled periods in the timetable
 */
// const getClassPeriods = (currSelectedClasses: Record<string, ClassCardView | null>[]) => {
//   return currSelectedClasses
//     .flatMap((activities) => Object.values(activities))
//     .flatMap((classData) => (classData ? classData.periods : []));
// };

/**
 * Populates a set of clashing periods
 * @param clashes The set of clashing periods
 * @param periods1 The first list of periods
 * @param periods2 The second list of periods to compare to
 */
const findClashingPeriods = (
  clashes: Set<ClassCardView>,
  cards: (ClassCardView)[],
) => {
  cards.forEach((period1) => {
    cards.forEach((period2) => {
      if (period1 !== period2 && hasTimeOverlap(period1, period2)) {
        clashes.add(period1);
        clashes.add(period2);
      }
    });
  });
};

/**
 * @param clash The clashing period
 * @returns The ID of the period
 */
// const getId = (clash: ClassCardView) => {
//   if (clash.type === 'class') {
//     return clash.classId;
//   } else {
//     return clash.event.id;
//   }
// };

/**
 * A clash can be between two classes, two custom events, or a class and a custom event
 * @param selectedClasses The currently selected classes
 * @param createdEvents The created custom events
 * @returns A list of unique clashing classes and custom events
 */
// const getClashes = (selectedClasses: SelectedClasses, createdEvents: CreatedEvents) => {
//   const clashes = new Set<ClassCardView>();

//   const currSelectedClasses = Object.values(selectedClasses);
//   const eventPeriods = Object.values(createdEvents);

//   if (currSelectedClasses !== null) {
//     const classPeriods = getClassPeriods(currSelectedClasses);
//     findClashingPeriods(clashes, classPeriods, classPeriods);
//   }

//   if (eventPeriods !== null) {
//     findClashingPeriods(clashes, eventPeriods, eventPeriods);
//   }

//   if (currSelectedClasses !== null && eventPeriods !== null) {
//     const classPeriods = getClassPeriods(currSelectedClasses);
//     findClashingPeriods(clashes, classPeriods, eventPeriods);
//   }

//   return Array.from(clashes);
// };

/**
 * @param clashDays The map of days to the list of clashes occurring on that day
 * @returns The map with each list sorted by starting time, then by ending time
 */
const sortClashesByTime = (clashDays: Record<number, ClassCardView[]>) => {
  for (const clashDay of Object.values(clashDays)) {
    clashDay.sort((a, b) => (a.startMinutes ?? 0) - (b.startMinutes ?? 0) || endTime(a) - endTime(b));
  }

  return clashDays;
};

/**
 * @param clashes The list of all clashing periods
 * @returns A map of a number (representing each day of the week) to the sorted list of clashing periods occurring on that day.
 * The days of the week are zero-indexed
 */
const sortClashesByDay = (clashes: ClassCardView[]) => {
  const clashDays: Record<number, ClassCardView[]> = daysLong.map((_) => []);
  clashes.forEach((clash) => {
    if (clash.dayIndex === undefined) {
      return
    }

    clashDays[clash.dayIndex].push(clash)
  });

  return sortClashesByTime(clashDays);
};

/**
 * @param sortedClashes The map of days to the list of clashes occurring on that day sorted by time.start then time.end
 * @returns The map of days with each list being further separated into smaller lists representing which classes are clashing with each other
 */
const groupClashes = (sortedClashes: Record<number, ClassCardView[]>) => {
  const groupedClashes: Record<number, ClassCardView[][]> = daysLong.map((_) => []);

  Object.entries(sortedClashes).forEach(([day, clashes]) => {
    const dayInt = parseInt(day);
    let curGroupEndTime = -1;
    for (const clash of clashes) {
      if ((clash.startMinutes ?? 0) >= curGroupEndTime) groupedClashes[dayInt].push([]); // new group if not clashing with cur
      groupedClashes[dayInt].at(-1)?.push(clash);
      curGroupEndTime = Math.max(curGroupEndTime, endTime(clash));
    }
  });

  return groupedClashes;
};

/**
 *
 * @param selectedClasses The currently selected classes
 * @param createdEvents The created custom events
 * @returns All classes and events grouped by day and clash group
 */
export const findClashes = (cards: ClassCardView[]) => {
  const clashes = new Set<ClassCardView>();
  findClashingPeriods(clashes, cards);
  const sortedClashes = sortClashesByDay([...clashes]);
  const groupedClashes = groupClashes(sortedClashes);

  return groupedClashes;
};

/**
 *
 * @param groupedClashes The clashing periods
 * @param card The current card
 * @returns A list containing the width of the card (expressed as a number between 0 and 100),
 * the index of the card in its clash group (to maintain the chronological order of clashing periods)
 * and the colour of the border of the card (red for non-permitted clash, orange for permitted clash, none for a custom event).
 */
export const getClashInfo = (
  groupedClashes: Record<number, ClassCardView[][]>,
  card: ClassCardView,
): ClashInfo => {
  const cardWidth = 100;
  const clashIndex = 0;
  // let clashColour = 'orange';

  const defaultValues = {cardWidth, clashIndex, clashColour: 'transparent'};

  if (card.dayIndex === undefined) {
    return defaultValues;
  }

  // if (card.type !== 'inventory') {
  const clashGroup = groupedClashes[card.dayIndex]?.find((group) => group.includes(card));

  if (!clashGroup) return defaultValues;

  const uniqueClashIDs = Array.from(new Set(clashGroup.map((clash) => clash.classId)));

  const nonLecturePeriods = clashGroup.filter((clash) => !clash.activity.includes('Lecture')).length;
  
  // let isOverlapped = false;

  //   const cardID = getId(card);

  //   clashGroup.forEach((clash) => {
  //     // Check if the current card has weeks that are overlapping with the weeks of the current clash.
  //     // Two classes with clashing times which occur on different weeks are not defined as a clash.
  //     if (clash.type === 'class' && card.type === 'class') {
  //       const hasOverlappingWeeks = card.time.weeks.some((week) => clash.time.weeks.includes(week));
  //       if (hasOverlappingWeeks && clash.classId !== card.classId) {
  //         isOverlapped = true;
  //       }
  //     }
  //   });

  //   if (nonLecturePeriods.length > 1 && card.type !== 'event') {
  //     clashColour = 'red';
  //   } else if (!isOverlapped) {
  //     clashColour = 'transparent';
  //   }

  return { 
    cardWidth: 100 / uniqueClashIDs.length,
    clashIndex: uniqueClashIDs.indexOf(card.classId),
    clashColour: nonLecturePeriods > 1 ? 'red' : 'orange' };
  // }
};