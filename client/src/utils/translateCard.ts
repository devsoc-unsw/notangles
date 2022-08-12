import { EventPeriod, InInventory } from '../interfaces/Periods';
import { ClassCard, isScheduledPeriod, timeToPosition } from './Drag';
import { inventoryMargin } from '../constants/theme';
import { rowHeight } from '../components/timetable/TimetableLayout';

export const classTranslateX = (
  card: ClassCard | EventPeriod,
  days?: string[],
  clashIndex?: number,
  width?: number,
  cellWidth?: number
) => {
  // This classCard is for a scheduled class
  if (isScheduledPeriod(card) && clashIndex !== undefined && width && cellWidth) {
    const numClashing = 100 / width;

    // cellWidth + 1 is the length of the gap between two cells, and we shift by this length times the day of the week of the class to shift it into the right cell
    // cellWidth / numClashing gives the width of this card in px, so we shift it extra by its width times the index it's in in the clash group
    return `${(cellWidth + 1) * (card.time.day - 1) + clashIndex * (cellWidth / numClashing)}px`;
    // p.s. The reason we are hardcoding cellWidth in pixels is so that it doesn't do such a wonky transition when the width of the card gets changed reacting to cards being moved around
  }

  // This classCard is for an unscheduled class, i.e. it belongs in the inventory
  if (days) {
    // This shifts by the cards length times the number of days plus days.length + 1 to account for the amount of column borders (of length 1px) it must translate,
    // plus the margin seperating the days of the week from unscheduled section
    return `calc(${days.length * 100}% + ${days.length + 1 + inventoryMargin}px)`;
  }

  return 0;
};

export const getClassHeight = (card: ClassCard | InInventory | EventPeriod) => {
  // height compared to standard row height
  const heightFactor = getHeightFactor(card);

  return `${rowHeight * heightFactor + (heightFactor - 1)}px`;
};

export const getHeightFactor = (classCard?: ClassCard | EventPeriod | InInventory) =>
  classCard && isScheduledPeriod(classCard) ? classCard.time.end - classCard.time.start : 1;

export const classTranslateY = (classCard: ClassCard | EventPeriod, earliestStartTime: number, y?: number) => {
  let result = 0;

  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(classCard);

  if (isScheduledPeriod(classCard)) {
    // This classCard is for a scheduled class
    // The number of rows to offset down
    const offsetRows = timeToPosition(classCard.time.start, earliestStartTime) - 2;

    // Calculate translation percentage (relative to height)
    result = offsetRows / heightFactor;
  } else if (y) {
    // This classCard is for an unscheduled class, i.e. it belongs in the inventory
    // Use the specified y-value
    result = y;
  }

  return `calc(${result * 100}% + ${result}px)`;
};
