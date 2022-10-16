import { inventoryMargin } from '../constants/theme';
import { rowHeight } from '../constants/timetable';
import { EventPeriod, InInventory } from '../interfaces/Periods';
import { ClassCard, isScheduledPeriod } from './Drag';

/**
 * Translates a card horizontally from the top left hand corner of the timetable
 *
 * @param card The card to translate
 * @param nDays The number of days shown in the timetable
 * @param clashIndex The index of the card in its clash group
 * @param width  The width of the card
 * @param cellWidth The width of a cell in the timetable
 * @returns The CSS for the number of pixels to translate horizontally
 */
export const classTranslateX = (
  card: ClassCard | EventPeriod,
  nDays?: number,
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
  if (nDays) {
    // This shifts by the cards length times the number of days
    // plus nDays + 1 to account for the amount of column borders (of length 1px),
    // plus the margin separating the days of the week from unscheduled section
    return `calc(${nDays * 100}% + ${nDays + 1 + inventoryMargin}px)`;
  }

  return 0;
};

/**
 * @param card The card
 * @returns The height of a class in pixels based on its duration
 */
export const getClassHeight = (card: ClassCard | InInventory | EventPeriod) => {
  // height compared to standard row height
  const heightFactor = getHeightFactor(card);

  return `${rowHeight * heightFactor + (heightFactor - 1)}px`;
};

/**
 * @param card The card
 * @returns The scale factor of a card's height based on its duration relative to a standard one hour class
 */
export const getHeightFactor = (card?: ClassCard | EventPeriod | InInventory) =>
  card && isScheduledPeriod(card) ? card.time.end - card.time.start : 1;

/**
 * Translates a card vertically from the top left hand corner of the timetable
 *
 * @param classCard The card to translate
 * @param earliestStartTime The earliest start time on the timetable
 * @param y The index of the card in the unscheduled classes list (since all unscheduled classes are the same height)
 * @returns The CSS for the number of pixels to translate vertically
 */
export const classTranslateY = (classCard: ClassCard | EventPeriod, earliestStartTime: number, y?: number) => {
  let result = 0;

  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(classCard);

  if (isScheduledPeriod(classCard)) {
    // This classCard is for a scheduled class
    // The number of rows to offset down
    const offsetRows = classCard.time.start - earliestStartTime;

    // Calculate translation percentage (relative to height)
    result = offsetRows / heightFactor;
  } else if (y) {
    // This classCard is for an unscheduled class, i.e. it belongs in the inventory
    // Use the specified y-value
    result = y;
  }

  return `calc(${result * 100}% + ${result}px)`;
};
