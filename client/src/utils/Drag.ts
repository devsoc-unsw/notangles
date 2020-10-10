import {
  ClassData, ClassPeriod, InventoryPeriod, InInventory,
} from '../interfaces/CourseData';
import { lightTheme } from '../constants/theme';

export type CardData = ClassPeriod | InventoryPeriod;

export const transitionTime = 350;
const heightTransitionTime = 150;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms, height ${heightTransitionTime}ms`;
export const elevatedScale = 1.1;
export const defaultShadow = 3;
export const elevatedShadow = 24;
// intersection area with inventory required to drop
const inventoryDropIntersection = 0.5;

export const isPeriod = (data: CardData | null): data is ClassPeriod => (
  data !== null && (data as ClassPeriod).time !== undefined
);

let dragTarget: CardData | null = null;
let dragSource: CardData | null = null;
let dropTarget: CardData | null = null;
let dragElement: HTMLElement | null = null;
let inventoryElement: HTMLElement | null = null;

let lastX = 0;
let lastY = 0;
let lastScrollX = 0;
let lastScrollY = 0;

window.addEventListener('load', () => {
  lastScrollX = document.documentElement.scrollLeft;
  lastScrollY = document.documentElement.scrollTop;
});

const getInventoryPeriod = (cardData: CardData): InventoryPeriod => (
  cardData.class.course.inventoryData[cardData.class.activity]
);

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const setShadow = (element: HTMLElement, elevated: boolean) => {
  // shadows are the same for light and dark theme
  element.style.boxShadow = lightTheme.shadows[elevated ? elevatedShadow : defaultShadow];
};

const moveElement = (element: HTMLElement, dx: number, dy: number) => {
  element.style.left = toPx(fromPx(element.style.left) + dx);
  element.style.top = toPx(fromPx(element.style.top) + dy);
};

export const timeToPosition = (time: number) => time - 7;

export const checkCanDrop = (a: CardData | null, b: CardData | null) => (
  a === null || b === null || a === b || (
    a.class.course.code === b.class.course.code
    && a.class.activity === b.class.activity
    && (
      !isPeriod(a) || !isPeriod(b)
      || a.time.end - a.time.start === b.time.end - b.time.start
    )
  )
);

const freezeTransform = (element: HTMLElement) => {
  element.style.transform = getComputedStyle(element).getPropertyValue('transform');
};

const unfreezeTransform = (element: HTMLElement) => {
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
const cards = new Map<CardData, HTMLElement>();

const updateDropzones = () => {
  Array.from(dropzones.entries()).forEach(([classPeriod, element]) => {
    const canDrop = dropTarget ? checkCanDrop(dropTarget, classPeriod) : false;

    const isDropTarget = (
      (classPeriod && classPeriod === dropTarget) // is period, and period is drop darget
      || (!classPeriod && !isPeriod(dropTarget)) // is inventory, and drop target is inventory class
    );

    let opacity = '0';

    if (canDrop) {
      if (isDropTarget) {
        opacity = '0.7';
      } else {
        opacity = classPeriod ? '0.3' : '0';
      }
    }

    element.style.opacity = opacity;
    element.style.pointerEvents = canDrop ? 'auto' : 'none';
  });
};

const updateCards = () => {
  Array.from(cards.entries()).forEach(([cardData, element]) => {
    const isElevated = (
      dragTarget !== null
      && (
        cardData === dragTarget
        || (
          isPeriod(cardData) && isPeriod(dragTarget)
          && cardData.class.course.code === dragTarget.class.course.code
          && cardData.class.activity === dragTarget.class.activity
        )
      )
    );

    let zIndex = isElevated ? 1200 : 1000;
    if (dragTarget !== null && cardData === dragTarget) {
      zIndex++;
    }

    element.style.zIndex = String(zIndex);
    element.style.cursor = dragTarget ? 'inherit' : 'grab';

    const inner = element.children[0] as HTMLElement;

    inner.style.transform = `scale(${isElevated ? elevatedScale : 1})`;

    setShadow(inner, isElevated);
  });
};

export const registerDropzone = (
  classPeriod: ClassPeriod | InInventory, element: HTMLElement, isInventory?: boolean,
) => {
  dropzones.set(classPeriod, element);
  if (isInventory) inventoryElement = element;
};

export const unregisterDropzone = (
  classPeriod: ClassPeriod | InInventory, isInventory?: boolean,
) => {
  dropzones.delete(classPeriod);
  if (isInventory) inventoryElement = null;
};

let updateTimeout: number;

export const registerCard = (data: CardData, element: HTMLElement) => {
  cards.set(data, element);
  // delays update until consecutive `registerCard` calls have concluded
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => updateCards(), 0);
};

export const unregisterCard = (data: CardData, element: HTMLElement) => {
  if (cards.get(data) === element) cards.delete(data);
};

type ClassHandler = (classData: ClassData) => void;

let selectClass: ClassHandler = () => {};
let removeClass: ClassHandler = () => {};

export const useDrag = (
  selectHandler: ClassHandler, removeHandler: ClassHandler,
) => {
  selectClass = selectHandler;
  removeClass = removeHandler;
};

const updateDelay = 30;
let lastUpdate = 0;

const updateDropTarget = (now?: boolean) => {
  // Cancel if: no drag happening, or update is too soon (except if now = true)
  if (
    !dragTarget || !dragElement
    || (!now && Date.now() - lastUpdate < updateDelay)
  ) return;

  lastUpdate = Date.now();

  const dragRect = dragElement.getBoundingClientRect();

  // dropzone with greatest area of intersection
  const bestMatch = Array.from(dropzones.entries()).filter(([classPeriod]) => (
    dragTarget && checkCanDrop(dragTarget, classPeriod)
  )).map(([classPeriod, dropElement]) => {
    let area = dragElement ? getIntersectionArea(
      dragRect, dropElement.getBoundingClientRect(),
    ) : 0;

    // avoid accidental inventory drop and state oscillation when drag area dynamically changes
    if (dropElement === inventoryElement && area < inventoryDropIntersection) area = 0;

    return { classPeriod, area };
  }).reduce((max, current) => (
    current.area > max.area ? current : max
  ), {
    classPeriod: undefined,
    area: 0,
  } as {
    classPeriod?: ClassPeriod | InInventory
    area: number
  });

  const { classPeriod, area } = bestMatch;
  const result = (
    classPeriod !== undefined && area > 0 ? classPeriod : dragSource
  );
  const newDropTarget = result !== null ? result : getInventoryPeriod(dragTarget);

  if (newDropTarget !== undefined && newDropTarget !== dropTarget) {
    dropTarget = newDropTarget;
    updateDropzones();

    if (isPeriod(newDropTarget)) {
      selectClass(newDropTarget.class);
    } else if (isPeriod(dragTarget)) {
      // moved to inventory
      removeClass(dragTarget.class);
    }
  }
};

export const morphCards = (a: CardData[], b: CardData[]) => {
  const from = [...a];
  let to = [...b];

  const result: (CardData | null)[] = Array(from.length).fill(null);

  if (
    dragTarget && dropTarget && dragTarget !== dropTarget
    && from.includes(dragTarget) && to.includes(dropTarget)
  ) {
    to = to.filter((cardData) => cardData !== dropTarget);
    result[from.indexOf(dragTarget)] = dropTarget;
    dragTarget = dropTarget;
  }

  from.forEach((fromCard: CardData, i: number) => {
    if (result[i] || !isPeriod(fromCard)) return;

    let match: CardData | null = null;

    if (to.includes(fromCard)) {
      match = fromCard;
    } else {
      const fromElement = dropzones.get(fromCard);

      if (fromElement) {
        const closest = to.filter((toCard) => (
          checkCanDrop(fromCard, toCard)
        )).map((toCard) => {
          const element = isPeriod(toCard) ? dropzones.get(toCard) : undefined;
          const distance = (
            element ? distanceBetween(fromElement, element) : Infinity
          );
          return { toCard, distance };
        }).reduce((min, current) => (
          current.distance < min.distance ? current : min
        ), {
          toCard: undefined,
          distance: Infinity,
        } as {
          toCard?: CardData
          distance: number
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

export const setDragTarget = (
  cardData: CardData | null, event?: MouseEvent & TouchEvent,
) => {
  if (cardData !== dragTarget) {
    if (cardData && event && event.currentTarget) {
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
    updateDropzones();
  }
};

const onMove = (x: number, y: number) => {
  if (!dragElement) return;

  moveElement(dragElement, x - lastX, y - lastY);
  lastX = x;
  lastY = y;

  updateDropTarget();
};

window.addEventListener('mousemove', (event: MouseEvent) => {
  onMove(event.pageX, event.pageY);
});

window.addEventListener('touchmove', (event: TouchEvent) => {
  if (event.touches.length > 0) {
    onMove(event.touches[0].pageX, event.touches[0].pageY);
  }

  if (dragElement) {
    event.preventDefault();
    event.stopPropagation();
  }
}, { passive: false });

window.addEventListener('scroll', () => {
  if (!dragElement) return;

  const dx = document.documentElement.scrollLeft - lastScrollX;
  const dy = document.documentElement.scrollTop - lastScrollY;

  lastX += dx;
  lastY += dy;
  lastScrollX += dx;
  lastScrollY += dy;

  moveElement(dragElement, dx, dy);
  updateDropTarget();
});

const drop = () => {
  if (dragElement) {
    const { style } = dragElement;
    style.transition = defaultTransition;
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
