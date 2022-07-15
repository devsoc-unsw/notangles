import { ClassData, ClassPeriod, ClassTime, CreatedEvents, EventPeriod, EventTime, SelectedClasses } from '../interfaces/Periods';
import { ClassCard } from './Drag';

const hasTimeOverlap = (period1: ClassTime | EventTime, period2: ClassTime | EventTime) =>
  period1.day === period2.day &&
  ((period1.end > period2.start && period1.start < period2.end) || (period2.end > period1.start && period2.start < period1.end));

const getClassPeriods = (currSelectedClasses: Record<string, ClassData | null>[]) => {
  return currSelectedClasses
    .flatMap((activities) => Object.values(activities))
    .flatMap((classData) => (classData ? classData.periods : []));
};

const findClashingPeriods = (
  clashes: Set<ClassPeriod | EventPeriod>,
  card1: (ClassPeriod | EventPeriod)[],
  card2: (ClassPeriod | EventPeriod)[]
) => {
  card1.forEach((period1) => {
    card2.forEach((period2) => {
      if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
        clashes.add(period1);
        clashes.add(period2);
      }
    });
  });
};

const getId = (clash: ClassPeriod | EventPeriod) => {
  if (clash.type === 'class') {
    return clash.class.id;
  } else {
    return clash.event.id;
  }
};

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

// Sort clashes by start time. If two clahes have the same start time,
// the clash with the earlier end time will come first.
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

// Group clashes according to the days of the week they are in.
const sortClashesByDay = (days: string[], clashes: (ClassPeriod | EventPeriod)[]) => {
  const clashDays: Record<number, (ClassPeriod | EventPeriod)[]> = days.map((_) => []);
  clashes.forEach((clash) => clashDays[clash.time.day - 1].push(clash));

  return sortClashesByTime(clashDays);
};

const groupClashes = (days: string[], sortedClashes: Record<number, (ClassPeriod | EventPeriod)[]>) => {
  const groupedClashes: Record<number, (ClassPeriod | EventPeriod)[][]> = days.map((_) => []);

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

export const findClashes = (selectedClasses: SelectedClasses, createdEvents: CreatedEvents, days: string[]) => {
  const clashes = getClashes(selectedClasses, createdEvents);
  const sortedClashes = sortClashesByDay(days, clashes);
  const groupedClashes = groupClashes(days, sortedClashes);

  return groupedClashes;
};

export const getClashInfo = (groupedClashes: Record<number, (ClassPeriod | EventPeriod)[][]>, card: ClassCard | EventPeriod) => {
  let cardWidth = 100;
  let clashIndex = 0;
  let clashColour = 'orange';

  const defaultValues = [cardWidth, clashIndex, 'transparent'];

  if (card.type !== 'inventory') {
    const clashGroup = groupedClashes[card.time.day - 1].find((group) => group.includes(card));
    if (!clashGroup) return defaultValues;

    // Get the length of the clash group according to the unique clash IDs.
    let uniqueClashIDs: string[] = [];
    let nonLecturePeriods: Set<string> = new Set();
    let isOverlapped = false;

    const cardID = getId(card);

    clashGroup.forEach((clash) => {
      const clashID = getId(clash);

      if (!uniqueClashIDs.includes(clashID)) {
        uniqueClashIDs.push(clashID);
      }

      if (clash.type === 'class' && !clash.class.activity.includes('Lecture')) {
        nonLecturePeriods.add(clashID);
      }

      // Check if the current card has weeks that are overlapping with
      // the weeks of the current clash.
      // This is so that two classes with clashing time but different weeks
      // are not supposed to clash (no border).
      if (clash.type === 'class' && card.type === 'class') {
        const hasOverlappingWeeks = card.time.weeks.some((week) => clash.time.weeks.indexOf(week) !== -1);
        if (hasOverlappingWeeks && clash.class.id !== card.class.id) {
          isOverlapped = true;
        }
      }
    });

    if (nonLecturePeriods.size > 1 && card.type !== 'event') {
      clashColour = 'red';
    } else if (!isOverlapped) {
      clashColour = 'transparent';
    }

    return [cardWidth / uniqueClashIDs.length, uniqueClashIDs.indexOf(cardID), clashColour];
  }

  return defaultValues;
};
