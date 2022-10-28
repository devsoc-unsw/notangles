import { daysLong } from '../constants/timetable';
import { ClassData, ClassPeriod, ClassTime, CreatedEvents, EventPeriod, EventTime, SelectedClasses } from '../interfaces/Periods';
import { ClassCard } from './Drag';

// Confluence docs regarding clashes: https://compclub.atlassian.net/wiki/spaces/N/pages/2227634185/Timetable+Clashes

/**
 * @param period1 The first period
 * @param period2 The second period
 * @returns Whether the two periods overlap
 */
const hasTimeOverlap = (period1: ClassTime | EventTime, period2: ClassTime | EventTime) =>
  period1.day === period2.day &&
  ((period1.end > period2.start && period1.start < period2.end) || (period2.end > period1.start && period2.start < period1.end));

/**
 * @param currSelectedClasses The currently selected classes
 * @returns A list of all the currently scheduled periods in the timetable
 */
const getClassPeriods = (currSelectedClasses: Record<string, ClassData | null>[]) => {
  return currSelectedClasses
    .flatMap((activities) => Object.values(activities))
    .flatMap((classData) => (classData ? classData.periods : []));
};

/**
 * Populates a set of clashing periods
 * @param clashes The set of clashing periods
 * @param periods1 The first list of periods
 * @param periods2 The second list of periods to compare to
 */
const findClashingPeriods = (
  clashes: Set<ClassPeriod | EventPeriod>,
  periods1: (ClassPeriod | EventPeriod)[],
  periods2: (ClassPeriod | EventPeriod)[]
) => {
  periods1.forEach((period1) => {
    periods2.forEach((period2) => {
      if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
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
const getId = (clash: ClassPeriod | EventPeriod) => {
  if (clash.type === 'class') {
    return clash.classId;
  } else {
    return clash.event.id;
  }
};

/**
 * A clash can be between two classes, two custom events, or a class and a custom event
 * @param selectedClasses The currently selected classes
 * @param createdEvents The created custom events
 * @returns A list of unique clashing classes and custom events
 */
const getClashes = (selectedClasses: SelectedClasses, createdEvents: CreatedEvents) => {
  const clashes: Set<ClassPeriod | EventPeriod> = new Set();

  let currSelectedClasses = Object.values(selectedClasses);
  let eventPeriods = Object.values(createdEvents);

  if (currSelectedClasses !== null) {
    const classPeriods = getClassPeriods(currSelectedClasses);
    findClashingPeriods(clashes, classPeriods, classPeriods);
  }

  if (eventPeriods !== null) {
    findClashingPeriods(clashes, eventPeriods, eventPeriods);
  }

  if (currSelectedClasses !== null && eventPeriods !== null) {
    const classPeriods = getClassPeriods(currSelectedClasses);
    findClashingPeriods(clashes, classPeriods, eventPeriods);
  }

  return Array.from(clashes);
};

/**
 * @param clashDays The map of days to the list of clashes occurring on that day
 * @returns The map with each list sorted by starting time, then by ending time
 */
const sortClashesByTime = (clashDays: Record<number, (ClassPeriod | EventPeriod)[]>) => {
  for (const clashDay of Object.values(clashDays)) {
    clashDay.sort((a, b) => {
      const startDiff = a.time.start - b.time.start;
      if (startDiff !== 0) return startDiff;
      return a.time.end - b.time.end;
    });
  }

  return clashDays;
};

/**
 * @param clashes The list of all clashing periods
 * @returns A map of a number (representing each day of the week) to the sorted list of clashing periods occurring on that day.
 * The days of the week are zero-indexed
 */
const sortClashesByDay = (clashes: (ClassPeriod | EventPeriod)[]) => {
  const clashDays: Record<number, (ClassPeriod | EventPeriod)[]> = daysLong.map((_) => []);
  clashes.forEach((clash) => clashDays[clash.time.day - 1].push(clash));

  return sortClashesByTime(clashDays);
};

/**
 * @param sortedClashes The map of days to the list of clashes occurring on that day sorted by time.start then time.end
 * @returns The map of days with each list being further separated into smaller lists representing which classes are clashing with each other
 */
const groupClashes = (sortedClashes: Record<number, (ClassPeriod | EventPeriod)[]>) => {
  const groupedClashes: Record<number, (ClassPeriod | EventPeriod)[][]> = daysLong.map((_) => []);

  Object.entries(sortedClashes).forEach(([day, clashes]) => {
    const dayInt = parseInt(day);
    let curGroupEndTime: number = -1;
    for (const clash of clashes) {
      if (clash.time.start >= curGroupEndTime) groupedClashes[dayInt].push([]); // new group if not clashing with cur
      groupedClashes[dayInt].at(-1)?.push(clash);
      curGroupEndTime = Math.max(curGroupEndTime, clash.time.end);
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
export const findClashes = (selectedClasses: SelectedClasses, createdEvents: CreatedEvents) => {
  const clashes = getClashes(selectedClasses, createdEvents);
  const sortedClashes = sortClashesByDay(clashes);
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
export const getClashInfo = (groupedClashes: Record<number, (ClassPeriod | EventPeriod)[][]>, card: ClassCard | EventPeriod) => {
  let cardWidth = 100;
  let clashIndex = 0;
  let clashColour = 'orange';

  const defaultValues = [cardWidth, clashIndex, 'transparent'];

  if (card.type !== 'inventory') {
    let clashGroup = undefined;

    try {
      clashGroup = groupedClashes[card.time.day - 1].find((group) => group.includes(card));
    } catch (err) {
      throw err;
    }

    if (!clashGroup) return defaultValues;

    const uniqueClashIDs = Array.from(new Set(clashGroup.map((clash) => getId(clash))));

    const nonLecturePeriods = clashGroup
      .filter((clash) => clash.type === 'class' && !clash.activity.includes('Lecture'))
      .map((clash) => getId(clash));
    let isOverlapped = false;

    const cardID = getId(card);

    clashGroup.forEach((clash) => {
      // Check if the current card has weeks that are overlapping with the weeks of the current clash.
      // Two classes with clashing times which occur on different weeks are not defined as a clash.
      if (clash.type === 'class' && card.type === 'class') {
        const hasOverlappingWeeks = card.time.weeks.some((week) => clash.time.weeks.indexOf(week) !== -1);
        if (hasOverlappingWeeks && clash.classId !== card.classId) {
          isOverlapped = true;
        }
      }
    });

    if (nonLecturePeriods.length > 1 && card.type !== 'event') {
      clashColour = 'red';
    } else if (!isOverlapped) {
      clashColour = 'transparent';
    }

    return [cardWidth / uniqueClashIDs.length, uniqueClashIDs.indexOf(cardID), clashColour];
  }

  return defaultValues;
};
