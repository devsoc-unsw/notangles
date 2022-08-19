import { contentPadding, lightTheme } from '../constants/theme';
import { timetableWidth } from '../constants/timetable';
import {
  ClassData,
  ClassPeriod,
  ClassTime,
  CourseData,
  EventPeriod,
  EventTime,
  InInventory,
  InventoryPeriod,
} from '../interfaces/Periods';
import storage from './storage';

export type ClassCard = ClassPeriod | InventoryPeriod;

export const transitionTime = 350;
const heightTransitionTime = 150;
export const defaultTransition = `all ${transitionTime}ms`;
export const moveTransition = `transform ${transitionTime}ms, height ${heightTransitionTime}ms`;

export const elevatedScale = 1.1; // How much bigger the cards should be when being dragged around
const inventoryDropIntersection = 0.5; // How much the cards should intersect with the unscheduled column to be placed inside it

export const getDefaultShadow = (isSquareEdges: boolean) => (isSquareEdges ? 0 : 3); // How much shadow each card should have by default
export const getElevatedShadow = (_: boolean) => 24; // How much shadow each card should have when it is picked up

/**
 *
 * @param data The period
 * @returns Whether the period is unscheduled
 */
export const isScheduledPeriod = (data: ClassCard | EventPeriod | null): data is ClassPeriod =>
  data !== null && (data as ClassPeriod).time !== undefined;

let dragTargetCourse: CourseData | null = null; // The course corresponding to the class currently being dragged
let dragTarget: ClassCard | EventPeriod | null = null; // The period that is currently being dragged around
let dropTarget: ClassCard | EventPeriod | null = null; // The period the dragTarget is currently hovering over/last hovered over
let dragSource: ClassCard | null = null; // The original period of the dragTarget
let dragElement: HTMLElement | null = null; // The HTML element associated with the dragTarget
let inventoryElement: HTMLElement | null = null; // The HTML element that is the unscheduled column
let lastX = 0; // The current x-coordinate of the dragTarget
let lastY = 0; // The current y-coordinate of the dragTarget
let lastScrollX = 0; // How far to the right the screen was last scrolled horizontally
let lastScrollY = 0; // How far down the screen was last scrolled vertically

let numDays: number;
let latestEndTime: number;
let earliestStartTime: number;

/**
 * These values come from the React context
 * @param days The number of days which should be shown
 * @param earliest The earliest start time of all classes
 * @param latest The latest end time of all classes
 */
export const setDropzoneRange = (days: number, earliest: number, latest: number) => {
  numDays = days;
  earliestStartTime = earliest;
  latestEndTime = latest;
};

const getInventoryPeriod = (courseData: CourseData, cardData: ClassCard): InventoryPeriod =>
  courseData.inventoryData[cardData.activity];

/**
 * @param period The period to retrieve class data for
 * @returns The class data for the class associated with the period
 */
const getClassDataFromPeriod = (period: ClassCard) => {
  const activities = dragTargetCourse?.activities[period.activity];
  if (!activities) return undefined;

  return activities.find((data) => data.id === period.classId);
};

/**
 * @param value The number of pixels with the unit px
 * @returns The numerical value of the number of pixels
 */
const fromPx = (value: string) => Number(value.split('px')[0]);

/**
 * @param value The numerical value of the number of pixels
 * @returns The string representing the number of pixels with the unit px
 */
export const toPx = (value: number) => `${value}px`;

/**
 * Sets the shadow size of the specified HTML element based on whether it is being dragged around or not
 * @param element The HTML element
 * @param elevated Whether the card is being dragged around or not
 */
export const setShadow = (element: HTMLElement, elevated: boolean) => {
  // shadows are the same for light and dark theme
  const isSquareEdges = storage.get('isSquareEdges');
  element.style.boxShadow = lightTheme.shadows[elevated ? getElevatedShadow(isSquareEdges) : getDefaultShadow(isSquareEdges)];
};

/**
 * Move a specified HTML element a certain number of pixels horizontally and vertically
 * @param element The HTML element
 * @param dx The change in the x position of the element
 * @param dy The change in the y position of the element
 */
export const moveElement = (element: HTMLElement, dx: number, dy: number) => {
  element.style.left = toPx(fromPx(element.style.left) + dx);
  element.style.top = toPx(fromPx(element.style.top) + dy);
};

/**
 * @param p1 The first period
 * @param p2 The second period
 * @returns Whether the two periods are of equal duration
 */
const equalDur = (p1: ClassPeriod, p2: ClassPeriod) => p1.time.end - p1.time.start === p2.time.end - p2.time.start;

/**
 * @param a The first period
 * @param b The second period
 * @returns Whether a can be dropped into b (or vice versa). Either a or b can be the dropzone
 */
export const checkCanDrop = (a: ClassCard | null, b: ClassCard | null) => {
  if (a === null || b === null || a === b) return true;

  const classDataA = getClassDataFromPeriod(a);
  const classDataB = getClassDataFromPeriod(b);

  const classData = classDataA ? classDataA : classDataB;

  if (!classData) return false;

  // The last || clause is necessary because not all periods for a given activity may be the same length
  return (
    a.courseCode === b.courseCode &&
    a.activity === b.activity &&
    (!isScheduledPeriod(a) ||
      !isScheduledPeriod(b) ||
      equalDur(a, b) ||
      classData.periods.indexOf(a) === classData.periods.indexOf(b) ||
      classData.periods.every((p, i) => i === 0 || equalDur(p, classData.periods[i - 1])))
  );
};

/**
 * Saves the original location of the HTML element and
 * prevents it from moving erratically as it passes through valid dropzones
 * @param element The HTML element to freeze
 */
export const freezeTransform = (element: HTMLElement) => {
  console.log(element.style.transform);
  element.style.transform = getComputedStyle(element).getPropertyValue('transform');
};

/**
 * Removes the previous transformation in preparation for
 * the new position of the element to be calculated
 * @param element
 */
export const unfreezeTransform = (element: HTMLElement) => {
  element.style.removeProperty('transform');
};

/**
 * @param drag The bounding rectangle of the element being dragged
 * @param drop The bounding rectangle of the drop target
 * @returns Their intersection area relative to the area of the dragged element's area
 */
const getIntersectionArea = (drag: DOMRect, drop: DOMRect) => {
  const left = Math.max(drag.left, drop.left);
  const right = Math.min(drag.right, drop.right);
  const bottom = Math.min(drag.bottom, drop.bottom);
  const top = Math.max(drag.top, drop.top);

  const dragArea = drag.width * drag.height;
  const intersectionArea = Math.max(0, right - left) * Math.max(0, bottom - top);

  return intersectionArea / dragArea;
};

/**
 * @param e1 The first element
 * @param e2 The second element
 * @returns The Euclidean distance in pixels between the top-left corners of the two elements
 */
const distanceBetween = (e1: Element, e2: Element) => {
  const r1 = e1.getBoundingClientRect();
  const r2 = e2.getBoundingClientRect();

  return Math.sqrt((r2.x - r1.x) ** 2 + (r2.y - r1.y) ** 2);
};

const dropzones = new Map<ClassPeriod | InInventory, HTMLElement>();
const classCards = new Map<ClassCard, HTMLElement>();
const eventCards = new Map<EventPeriod, HTMLElement>();

/**
 * Updates the CSS for the dropzones to render them as valid or invalid based on the current drop target
 */
const updateDropzones = () => {
  Array.from(dropzones.entries()).forEach(([classPeriod, element]) => {
    if (dropTarget?.type === 'event') return;

    const canDrop = dropTarget ? checkCanDrop(dropTarget, classPeriod) : false;

    const isDropTarget =
      (classPeriod && classPeriod === dropTarget) || // is period, and period is drop darget
      (!classPeriod && !isScheduledPeriod(dropTarget)); // is inventory, and drop target is inventory class

    let opacity = '0';

    if (canDrop) {
      if (isDropTarget) {
        opacity = '0.8';
      } else {
        opacity = classPeriod ? '0.5' : '0';
      }
    }

    element.style.opacity = opacity;
    element.style.pointerEvents = canDrop ? 'auto' : 'none';
    element.style.zIndex = canDrop ? '700' : '50';
  });
};

/**
 *
 * @param cardData The period
 * @returns Whether the card associated with that period is currently being dragged around
 */
const getIsElevated = (cardData: ClassCard | EventPeriod) => {
  if (cardData.type !== 'event' && dragTarget?.type !== 'event') {
    const isMatchingClasses =
      isScheduledPeriod(cardData) &&
      isScheduledPeriod(dragTarget) &&
      cardData.courseCode === dragTarget.courseCode &&
      cardData.activity === dragTarget.activity;

    return dragTarget !== null && (cardData === dragTarget || isMatchingClasses);
  } else {
    return dragTarget !== null && cardData === dragTarget;
  }
};

const initialZIndex = 100;
const initialElevatedZIndex = 750;
const elevatedZIndexOffset = initialElevatedZIndex - initialZIndex;
let zIndex = initialZIndex;

/**
 * @returns The zIndex to use for an elevated card
 */
const getElevatedZIndex = () => String(zIndex + elevatedZIndexOffset);

/**
 * Updates the CSS for the given HTML elements e.g. when a card is picked up or dropped
 * @param cards The map of periods to HTML elements to update
 */
const updateCards = (cards: Map<ClassCard | EventPeriod, HTMLElement>) => {
  Array.from(cards.entries()).forEach(([cardData, element]) => {
    const isElevated = getIsElevated(cardData);

    if (isElevated) {
      element.style.zIndex = getElevatedZIndex();
    } else if (Number(element.style.zIndex) >= initialElevatedZIndex) {
      element.style.zIndex = String(Number(element.style.zIndex) - elevatedZIndexOffset);
    }

    element.style.cursor = dragTarget ? 'inherit' : 'grab';

    const inner = element.children[0] as HTMLElement;
    inner.style.transform = `scale(${isElevated ? elevatedScale : 1})`;
    setShadow(inner, isElevated);
  });

  if (dragElement) {
    dragElement.style.zIndex = getElevatedZIndex();
  }
};

/**
 * Creates an entry in the map of all dropzones for a particular period
 * @param classPeriod The period
 * @param element The HTML element corresponding to the dropzone for that period
 * @param isInventory Whether the dropzone is the unscheduled column
 */
export const registerDropzone = (classPeriod: ClassPeriod | InInventory, element: HTMLElement, isInventory?: boolean) => {
  dropzones.set(classPeriod, element);
  if (isInventory) inventoryElement = element;
};

/**
 * Removes an entry from the map of all dropzones for a particular period
 * @param classPeriod The period
 * @param isInventory Whether the dropzone is the unscheduled column
 */
export const unregisterDropzone = (classPeriod: ClassPeriod | InInventory, isInventory?: boolean) => {
  dropzones.delete(classPeriod);
  if (isInventory) inventoryElement = null;
};

let updateTimeout: number;

/**
 * Creates an entry in the map of all cards for a particular period
 * @param data The period
 * @param element The HTML element corresponding to the card for that peroid
 */
export const registerCard = (data: ClassCard | EventPeriod, element: HTMLElement) => {
  data.type === 'event' ? eventCards.set(data, element) : classCards.set(data, element);

  // Delay the update until consecutive `registerCard` calls have concluded
  const cards = data.type === 'event' ? eventCards : classCards;
  clearTimeout(updateTimeout);
  updateTimeout = window.setTimeout(() => updateCards(cards), 0);
};

/**
 * Removes an entry from the map of all cards for a particular period
 * @param data The period
 * @param element The HTML element corresponding to the card for that period
 */
export const unregisterCard = (data: ClassCard | EventPeriod, element: HTMLElement) => {
  if (data.type === 'event') {
    if (eventCards.get(data) === element) eventCards.delete(data);
  } else {
    if (classCards.get(data) === element) classCards.delete(data);
  }
};

type ClassHandler = (classData: ClassData) => void;
type EventTimetHandler = (eventTime: EventTime, recordKey: string) => void;

let selectClass: ClassHandler = () => {};
let removeClass: ClassHandler = () => {};
let updateEventTime: EventTimetHandler = () => {};

export const useDrag = (selectHandler: ClassHandler, removeHandler: ClassHandler) => {
  selectClass = selectHandler;
  removeClass = removeHandler;
};

export const useEventDrag = (eventTimetHandler: EventTimetHandler) => {
  updateEventTime = eventTimetHandler;
};

const updateDelay = 30;
let lastUpdate = 0;

let currentClassTime: ClassTime | undefined;
const setCurrentClassTime = (time: ClassTime | undefined) => {
  currentClassTime = time;
};

const updateDropTarget = (now?: boolean) => {
  // Cancel if: no drag happening, or update is too soon (except if now = true)
  if (!dragTargetCourse || !dragTarget || !dragElement || (!now && Date.now() - lastUpdate < updateDelay)) return;

  lastUpdate = Date.now();

  if (dragTarget.type === 'event') return;

  const dragRect = dragElement.getBoundingClientRect();

  // dropzone with greatest area of intersection
  const bestMatch = Array.from(dropzones.entries())
    .filter(([classPeriod]) => dragTarget && dragTarget.type !== 'event' && checkCanDrop(dragTarget, classPeriod))
    .map(([classPeriod, dropElement]) => {
      let area = dragElement ? getIntersectionArea(dragRect, dropElement.getBoundingClientRect()) : 0;

      // avoid accidental inventory drop and state oscillation when drag area dynamically changes
      if (dropElement === inventoryElement && area < inventoryDropIntersection) area = 0;

      return { classPeriod, area };
    })
    .reduce((max, current) => (current.area > max.area ? current : max), {
      classPeriod: undefined,
      area: 0,
    } as {
      classPeriod?: ClassPeriod | InInventory;
      area: number;
    });
  1;

  const { classPeriod, area } = bestMatch;
  const result = classPeriod !== undefined && area > 0 ? classPeriod : dragSource;
  const newDropTarget = result !== null ? result : getInventoryPeriod(dragTargetCourse, dragTarget);

  if (newDropTarget !== undefined && newDropTarget !== dropTarget) {
    dropTarget = newDropTarget;
    updateDropzones();

    if (isScheduledPeriod(newDropTarget)) {
      let newTime = newDropTarget.time;
      if (
        !currentClassTime ||
        newTime.day !== currentClassTime.day ||
        newTime.start !== currentClassTime.start ||
        newTime.end !== currentClassTime.end
      ) {
        setCurrentClassTime(undefined);
        selectClass(getClassDataFromPeriod(newDropTarget)!);
      }
    } else if (isScheduledPeriod(dragTarget)) {
      // moved to inventory
      setCurrentClassTime(undefined);
      removeClass(getClassDataFromPeriod(dragTarget)!);
    }
  } else if (newDropTarget !== undefined && newDropTarget === dropTarget) {
  }
};

export const morphCards = (a: ClassCard[] | EventPeriod[], b: ClassCard[] | EventPeriod[]) => {
  const from = [...a];
  let to = [...b];

  const result: (ClassCard | EventPeriod | null)[] = Array(from.length).fill(null);

  if (dragTarget && dropTarget && dragTarget !== dropTarget && from.includes(dragTarget) && to.includes(dropTarget)) {
    to = to.filter((cardData) => cardData !== dropTarget);
    result[from.indexOf(dragTarget)] = dropTarget;
    dragTarget = dropTarget;
  }

  from.forEach((fromCard: ClassCard | EventPeriod, i: number) => {
    if (result[i]) return;
    if (fromCard.type !== 'event' && !isScheduledPeriod(fromCard)) return;

    let match: ClassCard | EventPeriod | null = null;

    if (to.includes(fromCard)) {
      match = fromCard;
    } else if (fromCard.type !== 'event') {
      const fromElement = dropzones.get(fromCard);

      if (fromElement) {
        const closest = (to as ClassPeriod[])
          .filter((toCard) => checkCanDrop(fromCard, toCard))
          .map((toCard) => {
            const element = isScheduledPeriod(toCard) ? dropzones.get(toCard) : undefined;
            const distance = element ? distanceBetween(fromElement, element) : Infinity;
            return { toCard, distance };
          })
          .reduce((min, current) => (current.distance < min.distance ? current : min), {
            toCard: undefined,
            distance: Infinity,
          } as {
            toCard?: ClassCard;
            distance: number;
          });

        const { toCard } = closest;
        match = toCard || null;
      } else {
        return;
      }
    }

    // remove from `to` array if match was found
    if (match) {
      to = to.filter((cardData) => cardData !== match);
    }

    result[i] = match;
  });

  return result;
};

let onScroll = (_?: Event) => {};

const getScrollElement = () => {
  const element = document.getElementById('StyledTimetableScroll');
  if (element) element.onscroll = onScroll;
  return element;
};

const edgeSize = 50;
const scrollSpeed = 0.32;

let clientX = 0;
let clientY = 0;
let lastFrame = Date.now();

onScroll = (event?) => {
  const scrollElement = getScrollElement();

  if (!scrollElement) return;

  const dx = scrollElement.scrollLeft - lastScrollX;
  const dy = document.documentElement.scrollTop - lastScrollY;

  if (dragElement) {
    moveElement(dragElement, dx, dy);
    updateDropTarget();

    event?.preventDefault();
    event?.stopPropagation();
  }

  lastX += dx;
  lastY += dy;
  lastScrollX = scrollElement.scrollLeft;
  lastScrollY = document.documentElement.scrollTop;
};

window.addEventListener('scroll', onScroll, { passive: false });

let eventId = '';

export const setDragTarget = (
  cardData: ClassCard | EventPeriod | null,
  courseData: CourseData | null,
  event?: MouseEvent & TouchEvent,
  givenEventId?: string
) => {
  if (cardData !== dragTarget) {
    const scrollElement = getScrollElement();

    if (givenEventId) eventId = givenEventId;

    if (cardData && event && event.currentTarget && scrollElement) {
      const element = event.currentTarget as HTMLElement;
      element.style.transition = moveTransition;
      document.documentElement.style.cursor = 'grabbing';

      if (typeof event.pageX === 'number' && typeof event.pageY === 'number') {
        lastX = event.pageX;
        lastY = event.pageY;
      } else if (typeof event.touches === 'object' && typeof event.touches[0] === 'object') {
        const touch = event.touches[0];
        if (typeof touch.pageX === 'number' && typeof touch.pageY === 'number') {
          lastX = touch.pageX;
          lastY = touch.pageY;
        }
      }

      lastX += scrollElement.scrollLeft;

      dragElement = element;
      freezeTransform(element);
      updateDropTarget(true);

      if (cardData.type !== 'event') {
        if (cardData.type === 'class') {
          setCurrentClassTime(cardData.time);
        } else {
          setCurrentClassTime(undefined);
        }
      }
    } else {
      dragElement = null;
    }

    dragTargetCourse = courseData;
    dragTarget = cardData;
    dropTarget = cardData;
    if (cardData?.type !== 'event') dragSource = cardData;

    if (cardData?.type !== 'event') {
      updateCards(classCards);
      updateDropzones();
    } else {
      updateCards(eventCards);
    }
  }
};

const onMove = (x: number, y: number) => {
  if (dragElement) {
    moveElement(dragElement, x - lastX, y - lastY);
    updateDropTarget();
  }

  lastX = x;
  lastY = y;
};

const onFrame = () => {
  if (dragElement) {
    const delta = Date.now() - lastFrame;
    const { clientWidth } = document.documentElement;
    const { clientHeight } = document.documentElement;
    const scrollElement = getScrollElement();

    if (clientY < edgeSize) {
      // top scroll
      document.documentElement.scrollTop -= scrollSpeed * delta;
    } else if (clientHeight - clientY < edgeSize) {
      // bottom scroll
      document.documentElement.scrollTop += scrollSpeed * delta;
    }

    if (
      scrollElement &&
      clientWidth - clientX < edgeSize &&
      scrollElement.scrollLeft < timetableWidth - window.innerWidth + contentPadding * 2
    ) {
      // right scroll
      scrollElement.scrollLeft += scrollSpeed * delta;
    } else if (scrollElement && clientX < edgeSize) {
      // left scroll
      scrollElement.scrollLeft -= scrollSpeed * delta;
    }

    onScroll();
  }

  lastFrame = Date.now();
  requestAnimationFrame(onFrame);
};

requestAnimationFrame(onFrame);

window.addEventListener('mousemove', (event: MouseEvent) => {
  if (dragElement) {
    event.preventDefault();
    event.stopPropagation();
  }

  const scrollElement = getScrollElement();

  if (scrollElement) {
    onMove(event.pageX + scrollElement.scrollLeft, event.pageY);
    clientX = event.clientX;
    clientY = event.clientY;
  }
});

window.addEventListener(
  'touchmove',
  (event: TouchEvent) => {
    if (dragElement) {
      event.preventDefault();
      event.stopPropagation();
    }

    const scrollElement = getScrollElement();

    if (scrollElement) {
      if (event.touches.length > 0) {
        onMove(event.touches[0].pageX + scrollElement.scrollLeft, event.touches[0].pageY);
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }
    }
  },
  { passive: false }
);

const drop = () => {
  if (dragElement) {
    const { style } = dragElement;
    style.transition = defaultTransition;
    style.left = toPx(0);
    style.top = toPx(0);

    if (dragTarget?.type === 'event') {
      // Snap an event to the nearest grid cell and update its time accordingly
      const gridChildren = dragElement.parentElement?.parentElement?.children;
      const dragrect = dragElement.children[0].getBoundingClientRect();

      if (gridChildren && dragTarget) {
        const baserect = gridChildren[1].getBoundingClientRect();

        // x and y displacement of the drag target from the start-point of the grid
        const displacementx = dragrect.x - baserect.x;
        const displacementy = dragrect.y - (baserect.y + baserect.height + 1);

        const itemRect = gridChildren[Math.floor(gridChildren.length / 2)].getBoundingClientRect(); // gridChildren.length - 5 is used to access an arbitrary item in the grid so we can get it's dimensions
        const [colIndex, rowIndex] = [Math.round(displacementx / itemRect.width), Math.round(displacementy / itemRect.height)]; // grid coords of drag target when released

        const eventLength = dragTarget.time.end - dragTarget.time.start;

        // ensure we released inside the grid
        if (colIndex >= 0 && colIndex < numDays && rowIndex >= 0 && rowIndex + eventLength <= latestEndTime - earliestStartTime) {
          updateEventTime(
            {
              day: 1 + colIndex,
              start: rowIndex + earliestStartTime,
              end: eventLength + rowIndex + earliestStartTime,
            } as EventTime,
            eventId
          );
        }
      }
    }

    document.documentElement.style.cursor = 'default';
    unfreezeTransform(dragElement);
  }

  setDragTarget(null, null);
  dropTarget = null;
};

window.addEventListener('mouseup', drop);
window.addEventListener('touchend', drop, { passive: false });
window.addEventListener('blur', drop);
