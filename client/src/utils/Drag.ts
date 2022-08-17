import { contentPadding, lightTheme } from '../constants/theme';
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

export const timetableWidth = 1100;
export const transitionTime = 350;
const heightTransitionTime = 150;
export const defaultTransition = `all ${transitionTime}ms`;
export const moveTransition = `transform ${transitionTime}ms, height ${heightTransitionTime}ms, width ${transitionTime}ms`;
export const elevatedScale = 1.1;
export const getDefaultShadow = (isSquareEdges: boolean) => (isSquareEdges ? 0 : 3);
export const getElevatedShadow = (_: boolean) => 24;
// intersection area with inventory required to drop
const inventoryDropIntersection = 0.5;

export const isScheduledPeriod = (data: ClassCard | EventPeriod | null): data is ClassPeriod =>
  data !== null && (data as ClassPeriod).time !== undefined;

let dragTargetCourse: CourseData | null = null;
let dragTarget: ClassCard | EventPeriod | null = null;
let dropTarget: ClassCard | EventPeriod | null = null;
let dragSource: ClassCard | null = null;
let dragElement: HTMLElement | null = null;
let inventoryElement: HTMLElement | null = null;
let lastX = 0;
let lastY = 0;
let lastScrollX = 0;
let lastScrollY = 0;

let numDays: number;
let latestEndTime: number;
let earliestStartTime: number;

export const setDropzoneRange = (numDaysHandler: number, earliestStartTimeHandler: number, latestEndTimeHandler: number) => {
  numDays = numDaysHandler;
  earliestStartTime = earliestStartTimeHandler;
  latestEndTime = latestEndTimeHandler;
};

const getInventoryPeriod = (courseData: CourseData, cardData: ClassCard): InventoryPeriod =>
  courseData.inventoryData[cardData.activity];

const getClassDataFromPeriod = (period: ClassCard) => {
  const activities = dragTargetCourse?.activities[period.activity];
  if (!activities) return undefined;

  return activities.find((data) => data.id === period.classId);
};

const fromPx = (value: string) => Number(value.split('px')[0]);
export const toPx = (value: number) => `${value}px`;

export const setShadow = (element: HTMLElement, elevated: boolean) => {
  // shadows are the same for light and dark theme
  const isSquareEdges = storage.get('isSquareEdges');
  element.style.boxShadow = lightTheme.shadows[elevated ? getElevatedShadow(isSquareEdges) : getDefaultShadow(isSquareEdges)];
};

export const moveElement = (element: HTMLElement, dx: number, dy: number) => {
  element.style.left = toPx(fromPx(element.style.left) + dx);
  element.style.top = toPx(fromPx(element.style.top) + dy);
};

export const timeToPosition = (time: number, earliestStartTime: number) => time - (earliestStartTime - 2);

const equalDur = (p1: ClassPeriod, p2: ClassPeriod) => p1.time.end - p1.time.start === p2.time.end - p2.time.start;

export const checkCanDrop = (a: ClassCard | null, b: ClassCard | null) => {
  if (a === null || b === null || a === b) return true;

  const classDataA = getClassDataFromPeriod(a);
  const classDataB = getClassDataFromPeriod(b);

  const classData = classDataA ? classDataA : classDataB;

  if (!classData) return false;

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

export const freezeTransform = (element: HTMLElement) => {
  element.style.transform = getComputedStyle(element).getPropertyValue('transform');
};

export const unfreezeTransform = (element: HTMLElement) => {
  element.style.removeProperty('transform');
};

// given drag and drop bounding rects, returns intersection area relative to drag area
const getIntersectionArea = (drag: DOMRect, drop: DOMRect) => {
  const left = Math.max(drag.left, drop.left);
  const right = Math.min(drag.right, drop.right);
  const bottom = Math.min(drag.bottom, drop.bottom);
  const top = Math.max(drag.top, drop.top);

  const dragArea = drag.width * drag.height;
  const intersectionArea = Math.max(0, right - left) * Math.max(0, bottom - top);

  return intersectionArea / dragArea;
};

const distanceBetween = (e1: Element, e2: Element) => {
  const r1 = e1.getBoundingClientRect();
  const r2 = e2.getBoundingClientRect();

  return Math.sqrt((r2.x - r1.x) ** 2 + (r2.y - r1.y) ** 2);
};

const dropzones = new Map<ClassPeriod | InInventory, HTMLElement>();
const classCards = new Map<ClassCard, HTMLElement>();
const eventCards = new Map<EventPeriod, HTMLElement>();

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

const getElevatedZIndex = () => String(zIndex++ + elevatedZIndexOffset);

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

export const registerDropzone = (classPeriod: ClassPeriod | InInventory, element: HTMLElement, isInventory?: boolean) => {
  dropzones.set(classPeriod, element);
  if (isInventory) inventoryElement = element;
};

export const unregisterDropzone = (classPeriod: ClassPeriod | InInventory, isInventory?: boolean) => {
  dropzones.delete(classPeriod);
  if (isInventory) inventoryElement = null;
};

let updateTimeout: number;

export const registerCard = (data: ClassCard | EventPeriod, element: HTMLElement) => {
  data.type === 'event' ? eventCards.set(data, element) : classCards.set(data, element);

  // delays update until consecutive `registerCard` calls have concluded
  const cards = data.type === 'event' ? eventCards : classCards;
  clearTimeout(updateTimeout);
  updateTimeout = window.setTimeout(() => updateCards(cards), 0);
};

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
