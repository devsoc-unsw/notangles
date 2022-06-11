import { contentPadding, lightTheme } from '../constants/theme';
import { ClassData, ClassPeriod, ClassTime, EventTime, InInventory, InventoryPeriod } from '../interfaces/Course';
import storage from './storage';
import { EventData } from '../interfaces/Course';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const timetableWidth = 1100;
export const transitionTime = 350;
const heightTransitionTime = 150;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms, height ${heightTransitionTime}ms`;
export const elevatedScale = 1.1;
export const getDefaultShadow = (isSquareEdges: boolean) => (isSquareEdges ? 0 : 3);
export const getElevatedShadow = (_: boolean) => 24;
// intersection area with inventory required to drop
const inventoryDropIntersection = 0.5;

// export const isPeriod = (data: EventData | null): data is ClassPeriod => data !== null

let dragTarget: EventData | null = null;
let dragSource: EventData | null = null;
let dropTarget: EventData | null = null;
let dragElement: HTMLElement | null = null;
let inventoryElement: HTMLElement | null = null;
let lastX = 0;
let lastY = 0;
let lastScrollX = 0;
let lastScrollY = 0;

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const setShadow = (element: HTMLElement, elevated: boolean) => {
  // shadows are the same for light and dark theme
  const isSquareEdges = storage.get('isSquareEdges');
  element.style.boxShadow = lightTheme.shadows[elevated ? getElevatedShadow(isSquareEdges) : getDefaultShadow(isSquareEdges)];
};

const moveElement = (element: HTMLElement, dx: number, dy: number) => {
  element.style.left = toPx(fromPx(element.style.left) + dx);
  element.style.top = toPx(fromPx(element.style.top) + dy);
};

export const timeToPosition = (time: number, earliestStartTime: number) => time - (earliestStartTime - 2);

export const checkCanDrop = (a: EventData | null, b: EventData | null) => a === null || b === null || a === b;

// type EventHandler = (eventData: EventData) => void;

// let numDaysHandler: EventHandler = () => {};
// let earliestStartTimeHandler: EventHandler = () => {};
// let latestEventTimeHandler: EventHandler = () => {};

let numDays: number; // update me reactively!!!
let latestEndTime: number; // update me reactively!!!
let earliestStartTime: number; // update me reactively!!!

export const dropzoneRange = (numDaysHandler: number, earliestStartTimeHandler: number, latestEventTimeHandler: number) => {
  numDays = numDaysHandler;
  earliestStartTime = earliestStartTimeHandler;
  latestEndTime = latestEventTimeHandler;
};

const freezeTransform = (element: HTMLElement) => {
  element.style.transform = getComputedStyle(element).getPropertyValue('transform');
};

const unfreezeTransform = (element: HTMLElement) => {
  element.style.removeProperty('transform');
};

const cards = new Map<EventData, HTMLElement>();

const getIsElevated = (cardData: EventData) => dragTarget !== null && cardData === dragTarget;

const initialZIndex = 100;
const initialElevatedZIndex = 750;
const elevatedZIndexOffset = initialElevatedZIndex - initialZIndex;
let zIndex = initialZIndex;

const getElevatedZIndex = () => String(zIndex++ + elevatedZIndexOffset);

const updateCards = () => {
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

let updateTimeout: number;

export const registerCard = (data: EventData, element: HTMLElement) => {
  cards.set(data, element);
  // delays update until consecutive `registerCard` calls have concluded
  clearTimeout(updateTimeout);
  updateTimeout = window.setTimeout(() => updateCards(), 0);
};

export const unregisterCard = (data: EventData, element: HTMLElement) => {
  if (cards.get(data) === element) cards.delete(data);
};

export const useEventDrag = (timeHandler: UpdateEventTime) => {
  eventTimeUpdater = timeHandler;
};

type UpdateEventTime = (eventTime: EventTime, recordKey: string) => void;
let eventTimeUpdater: UpdateEventTime = () => {};

const updateDelay = 30;
let lastUpdate = 0;

const updateDropTarget = (now?: boolean) => {
  // Cancel if: no drag happening, or update is too soon (except if now = true)
  if (!dragTarget || !dragElement || (!now && Date.now() - lastUpdate < updateDelay)) return;

  lastUpdate = Date.now();
};

export const morphCards = (a: EventData[], b: EventData[]) => {
  const from = [...a];
  let to = [...b];

  const result: (EventData | null)[] = Array(from.length).fill(null);

  if (dragTarget && dropTarget && dragTarget !== dropTarget && from.includes(dragTarget) && to.includes(dropTarget)) {
    to = to.filter((cardData) => cardData !== dropTarget);
    result[from.indexOf(dragTarget)] = dropTarget;
    dragTarget = dropTarget;
  }

  from.forEach((fromCard: EventData, i: number) => {
    if (result[i]) return;

    let match: EventData | null = null;

    if (to.includes(fromCard)) {
      match = fromCard;
    } else {
      // const fromElement = dropzones.get(fromCard);
      return;
      // if (fromElement) {
      //   const closest = to
      //     .filter((toCard) => checkCanDrop(fromCard, toCard))
      //     .map((toCard) => {
      //       const element = isPeriod(toCard) ? dropzones.get(toCard) : undefined;
      //       const distance = element ? distanceBetween(fromElement, element) : Infinity;
      //       return { toCard, distance };
      //     })
      //     .reduce((min, current) => (current.distance < min.distance ? current : min), {
      //       toCard: undefined,
      //       distance: Infinity,
      //     } as {
      //       toCard?: EventData;
      //       distance: number;
      //     });

      //   const { toCard } = closest;
      //   match = toCard || null;
      // } else {
      //   return;
      // }
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

let eventRecordKey = '';

export const setDragTarget = (cardData: EventData | null, event?: MouseEvent & TouchEvent, recordKey?: string) => {
  if (cardData !== dragTarget) {
    const scrollElement = getScrollElement();
    if (recordKey) {
      eventRecordKey = recordKey;
    }

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
    } else {
      dragElement = null;
    }

    dragTarget = cardData;
    dragSource = cardData;
    dropTarget = cardData;

    updateCards();
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
  // const { days, latestEventTime } = useContext(AppContext);
  // const numDays: number = days.length; // update me reactively!!!
  // const latestEndTime: number = Math.ceil(latestEventTime); // update me reactively!!!

  if (dragElement) {
    const { style } = dragElement;
    style.transition = defaultTransition;

    var gridChildren = dragElement.parentElement?.parentElement?.children;
    var dragrect = dragElement.getBoundingClientRect();

    if (gridChildren && dragTarget) {
      var baserect = gridChildren[1].getBoundingClientRect();

      // x and y displacement of the drag target from the start-point of the grid
      var displacementx = dragrect.x - baserect.x;
      var displacementy = dragrect.y - (baserect.y + baserect.height + 1);

      var itemRect = gridChildren[gridChildren.length - 5].getBoundingClientRect(); // gridChildren.length - 5 is used to access an arbitrary item in the grid so we can get it's dimensions
      var [colIndex, rowIndex] = [Math.round(displacementx / itemRect.width), Math.round(displacementy / itemRect.height)]; // grid coords of drag target when released

      // console.log('xy', colIndex, rowIndex)

      const eventLength = dragTarget.time.end - dragTarget.time.start;

      // ensure we released inside the grid
      if (colIndex >= 0 && colIndex < numDays && rowIndex >= 0 && rowIndex + eventLength <= latestEndTime - earliestStartTime) {
        eventTimeUpdater(
          {
            
            day: 1 + colIndex,
            start: rowIndex + earliestStartTime,
            end: eventLength + rowIndex + earliestStartTime,
          } as EventTime,
          eventRecordKey
        );
        // console.log(earliestStartTime);
      }
    }
    style.left = toPx(0);
    style.top = toPx(0);

    document.documentElement.style.cursor = 'default';
    unfreezeTransform(dragElement);
  }

  setDragTarget(null);
  dropTarget = null;
};

window.addEventListener('mouseup', drop);
window.addEventListener('touchend', drop, { passive: false });
window.addEventListener('blur', drop);
