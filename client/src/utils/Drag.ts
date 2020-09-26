import {
  CourseData, ClassData, ClassPeriod, InventoryPeriod
} from '../interfaces/CourseData';

export const transitionTime = 350;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;
export const elevatedScale = 1.1;
export const defaultShadow = 3;
export const elevatedShadow = 24;

export type CardData = ClassPeriod | InventoryPeriod;

export const isPeriod = (data: CardData | null): data is ClassPeriod => {
  return data !== null && (data as ClassPeriod).time !== undefined;
}

let dragTarget: CardData | null = null;
let dragSource: CardData | null = null;
let dropTarget: CardData | null = null;
let dragElement: HTMLElement | null = null;
// let lastUpdate = 0;
let lastX = 0;
let lastY = 0;
let lastScrollX = 0;
let lastScrollY = 0;

window.addEventListener("load", () => {
  lastScrollX = document.documentElement.scrollLeft;
  lastScrollY = document.documentElement.scrollTop;
});

const getInventoryPeriod = (cardData: CardData): InventoryPeriod => (
  cardData.class.inventoryData
)

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const shadowClassName = (n: number) => `MuiPaper-elevation${n}`;
const setShadow = (element: HTMLElement, elevated: boolean) => {
  if (elevated) {
    element.classList.remove(shadowClassName(defaultShadow));
    element.classList.add(shadowClassName(elevatedShadow));
  } else {
    element.classList.remove(shadowClassName(elevatedShadow));
    element.classList.add(shadowClassName(defaultShadow));
  }
}

const moveElement = (element: HTMLElement, dx: number, dy: number) => {
  element.style.left = toPx(fromPx(element.style.left) + dx);
  element.style.top = toPx(fromPx(element.style.top) + dy);
};

export const timeToPosition = (time: number) => Math.floor(time) - 7;

const classTranslateX = (cardData: CardData, days?: string[]) => {
  let result = 0;
  if (isPeriod(cardData)) {
    result = cardData.time.day - 1
  } else if (days) {
    result = days.length
  }
  return result * 100;
};

const classTranslateY = (cardData: CardData) => {
  if (isPeriod(cardData)) {
    // height compared to standard row height
    const heightFactor = cardData.time.end - cardData.time.start;
    // number of rows to offset down
    const offsetRows = timeToPosition(cardData.time.start) - 2;
    // calculate translate percentage (relative to height)
    return (offsetRows / heightFactor) * 100;
  } else {
    return 3; // TODO
  }
};

export const classTransformStyle = (cardData: CardData, days?: string[]) => (
  `translate(${classTranslateX(cardData, days)}%, ${classTranslateY(cardData)}%)`
);

export const checkCanDrop = (a: CardData | null, b: CardData | null) => (
  a === null || b === null || a === b || (
    a.class.courseCode === b.class.courseCode
    && a.class.activity === b.class.activity
    && (
      !isPeriod(a) || !isPeriod(b)
      || a.time.end - a.time.start === b.time.end - b.time.start
    )
  )
);

const freezeTransform = (element: HTMLElement, cardData: CardData) => {
  element.style.transform = classTransformStyle(cardData);
};

const unfreezeTransform = (element: HTMLElement) => {
  element.style.removeProperty('transform');
};

const intersectionArea = (r1: DOMRect, r2: DOMRect) => {
  const left = Math.max(r1.left, r2.left);
  const right = Math.min(r1.right, r2.right);
  const bottom = Math.min(r1.bottom, r2.bottom);
  const top = Math.max(r1.top, r2.top);

  return Math.max(0, right - left) * Math.max(0, bottom - top);
};

const distanceBetween = (e1: Element, e2: Element) => {
  const r1 = e1.getBoundingClientRect();
  const r2 = e2.getBoundingClientRect();

  return Math.sqrt((r2.x - r1.x) ** 2 + (r2.y - r1.y) ** 2);
};

const dropzones = new Map<ClassPeriod | null, HTMLElement>();

export const registerDropzone = (
  classPeriod: ClassPeriod | null, element: HTMLElement
) => {
  dropzones.set(classPeriod, element);
};

export const unregisterDropzone = (
  classPeriod: ClassPeriod | null
) => {
  dropzones.delete(classPeriod);
};

const cards = new Map<CardData, HTMLElement>();

export const registerCard = (data: CardData, element: HTMLElement) => {
  cards.set(data, element);
};

export const unregisterCard = (data: CardData) => {
  cards.delete(data);
};

const updateDropzones = () => {
  Array.from(dropzones.entries()).forEach(([classPeriod, element]) => {
    const canDrop = dropTarget ? checkCanDrop(dropTarget, classPeriod) : false;
    const isDropTarget = classPeriod && classPeriod === dropTarget;

    let opacity = '0';
    if (canDrop) opacity = isDropTarget ? '0.7' : '0.3';

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
          && cardData.class.courseCode === dragTarget.class.courseCode
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
}

let selectClass: ((classData: ClassData) => void) = () => {};
let removeClass: ((courseCode: string, activity: string) => void) = () => {};

export const useDrag = (
  selectHandler: (classData: ClassData) => void,
  removeHandler: (courseCode: string, activity: string) => void,
) => {
  selectClass = selectHandler;
  removeClass = removeHandler;
}

const updateDelay = 30;
let lastUpdate = 0;

const updateDropTarget = (now?: boolean) => {
  // Cancel if no drag, or update too soon (except if now = true)
  if (
    !dragTarget || !dragElement
    || (!now && Date.now() - lastUpdate < updateDelay)
  ) return;

  lastUpdate = Date.now()

  const dragRect = dragElement.getBoundingClientRect();

  // dropzone with greatest area of intersection
  const bestMatch = Array.from(dropzones.entries()).filter(([classPeriod]) => (
    dragTarget && checkCanDrop(dragTarget, classPeriod)
  )).map(([classPeriod, dropElement]) => (
    {
      classPeriod,
      area: dragElement ? intersectionArea(
        dragRect, dropElement.getBoundingClientRect(),
      ) : 0,
    }
  )).reduce((max, current) => (
    current.area > max.area ? current : max
  ), {
    classPeriod: undefined,
    area: 0,
  } as {
    classPeriod?: ClassPeriod | null
    area: number
  });

  const { classPeriod, area } = bestMatch;
  const result = (
    classPeriod !== undefined && area > 0 ? classPeriod : dragSource
  );
  const newDropTarget = result !== null ? result : getInventoryPeriod(dragTarget);

  // console.log(newDropTarget === dropTarget, newDropTarget, dropTarget)

  if (newDropTarget !== undefined && newDropTarget !== dropTarget) {
    if (isPeriod(newDropTarget)) {
      selectClass(newDropTarget.class);
    } else {
      // moved to inventory
      removeClass(dragTarget.class.courseCode, dragTarget.class.activity);
    }

    dropTarget = newDropTarget;
    updateDropzones();
  }
};

export const morphCards = (a: CardData[], b: CardData[]) => {
  const from = [...a];
  let to = [...b];

  const result: (CardData | null)[] = Array(from.length).fill(null);

  if (
    dragTarget && dropTarget && dragTarget !== dropTarget
    && from.includes(dragTarget) && to.includes(dragTarget)
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
  cardData: CardData | null, event?: MouseEvent & TouchEvent
) => {
  if (cardData !== dragTarget) {
    if (cardData && event && event.currentTarget) {
      const element = event.currentTarget as HTMLElement;
      element.style.transition = moveTransition;
      document.documentElement.style.cursor = 'grabbing';

      if (typeof event.pageX === "number" && typeof event.pageY === "number") {
        lastX = event.pageX
        lastY = event.pageY
      } else if (typeof event.touches === "object" && typeof event.touches[0] === "object") {
        const touch = event.touches[0]
        if (typeof touch.pageX === "number" && typeof touch.pageY === "number") {
          lastX = touch.pageX
          lastY = touch.pageY
        }
      }
      
      dragElement = element;
      freezeTransform(element, cardData);
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
  if (!dragElement) return

  moveElement(dragElement, x - lastX, y - lastY);
  lastX = x
  lastY = y

  updateDropTarget()
}

window.addEventListener("mousemove", (event: MouseEvent) => {
  onMove(event.pageX, event.pageY)
});

window.addEventListener("touchmove", (event: TouchEvent) => {
  if (event.touches.length > 0) {
    onMove(event.touches[0].pageX, event.touches[0].pageY)
  }

  if (dragElement) {
    event.preventDefault()
    event.stopPropagation()
  }
}, {passive: false})

window.addEventListener("scroll", () => {
  if (!dragElement) return

  let dx = document.documentElement.scrollLeft - lastScrollX
  let dy = document.documentElement.scrollTop - lastScrollY

  lastX += dx
  lastY += dy
  lastScrollX += dx
  lastScrollY += dy

  moveElement(dragElement, dx, dy)
  updateDropTarget()
})

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

window.addEventListener("mouseup", drop)
window.addEventListener("touchend", drop, {passive: false})
window.addEventListener("blur", drop)
