import { ClassData, ClassPeriod } from '../interfaces/CourseData';

export const transitionTime = 350;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;
export const elevatedScale = 1.1;
export const defaultShadow = 3;
export const elevatedShadow = 24;

let dragTarget: ClassPeriod | null = null;
let dragSource: ClassPeriod | null = null;
let dropTarget: ClassPeriod | null = null;
let dragElement: HTMLElement | null = null;
// let lastUpdate = 0;
let lastX = 0;
let lastY = 0;
let lastScrollX = 0;
let lastScrollY = 0;

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

const classTranslateX = (classPeriod: ClassPeriod) => (
  (classPeriod.time.day - 1) * 100
);

const classTranslateY = (classPeriod: ClassPeriod) => {
  // height compared to standard row height
  const heightFactor = classPeriod.time.end - classPeriod.time.start;
  // number of rows to offset down
  const offsetRows = timeToPosition(classPeriod.time.start) - 2;
  // calculate translate percentage (relative to height)
  return (offsetRows / heightFactor) * 100;
};

export const classTransformStyle = (classPeriod: ClassPeriod) => (
  `translate(${classTranslateX(classPeriod)}%, ${classTranslateY(classPeriod)}%)`
);

export const checkCanDrop = (a: ClassPeriod, b: ClassPeriod) => (
  a === b || (
    a.class.course.code === b.class.course.code
    && a.class.activity === b.class.activity
    && a.time.end - a.time.start === b.time.end - b.time.start
  )
);

const freezeTransform = (element: HTMLElement, classPeriod: ClassPeriod) => {
  element.style.transform = classTransformStyle(classPeriod);
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

const dropzones = new Map<ClassPeriod, HTMLElement>();

export const registerDropzone = (classPeriod: ClassPeriod, element: HTMLElement) => {
  dropzones.set(classPeriod, element);
};

export const unregisterDropzone = (classPeriod: ClassPeriod) => {
  dropzones.delete(classPeriod);
};

const periods = new Map<ClassPeriod, HTMLElement>();

export const registerPeriod = (classPeriod: ClassPeriod, element: HTMLElement) => {
  periods.set(classPeriod, element);
};

export const unregisterPeriod = (classPeriod: ClassPeriod) => {
  periods.delete(classPeriod);
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

const updatePeriods = () => {
  Array.from(periods.entries()).forEach(([classPeriod, element]) => {
    const isElevated = (
      dragTarget !== null
      && classPeriod.class.course.code === dragTarget.class.course.code
      && classPeriod.class.activity === dragTarget.class.activity
    );
  
    let zIndex = isElevated ? 1200 : 1000;
    if (dragTarget !== null && classPeriod === dragTarget) {
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

export const useDrag = (handler: (classData: ClassData) => void) => {
  selectClass = handler;
}

const updateDropTarget = () => {
  if (!dragTarget || !dragElement) {
    return;
  }

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
    classPeriod?: ClassPeriod
    area: number
  });

  const { classPeriod, area } = bestMatch;
  const newDropTarget = classPeriod && area > 0 ? classPeriod : dragSource;

  if (newDropTarget && newDropTarget !== dropTarget) {
    dropTarget = newDropTarget;
    updateDropzones();
    selectClass(newDropTarget.class);
  }
};

export const morphPeriods = (a: ClassPeriod[], b: ClassPeriod[]) => {
  const from = [...a];
  let to = [...b];

  const result: (ClassPeriod | null)[] = Array(from.length).fill(null);

  if (
    dragTarget && dropTarget && dragTarget !== dropTarget
    && from.includes(dragTarget) && to.includes(dropTarget)
  ) {
    to = to.filter((period) => period !== dropTarget);
    result[from.indexOf(dragTarget)] = dropTarget;
    dragTarget = dropTarget;
  }

  from.forEach((fromPeriod: ClassPeriod, i: number) => {
    if (result[i]) return;

    let match: ClassPeriod | null = null;

    if (to.includes(fromPeriod)) {
      match = fromPeriod;
    } else {
      const fromElement = dropzones.get(fromPeriod);

      if (fromElement) {
        const closest = to.filter((toPeriod) => (
          checkCanDrop(fromPeriod, toPeriod)
        )).map((toPeriod) => {
          const element = dropzones.get(toPeriod);
          const distance = (
            element ? distanceBetween(fromElement, element) : Infinity
          );
          return { toPeriod, distance };
        }).reduce((min, current) => (
          current.distance < min.distance ? current : min
        ), {
          toPeriod: undefined,
          distance: Infinity,
        } as {
          toPeriod?: ClassPeriod
          distance: number
        });

        const { toPeriod } = closest;
        match = toPeriod || null;
      } else {
        return;
      }
    }

    // remove from `to` array if match was found
    if (match) {
      to = to.filter((period) => period !== match);
    }

    result[i] = match;
  });

  return result;
};

export const setDragTarget = (
  classPeriod: ClassPeriod | null, event?: MouseEvent & TouchEvent
) => {
  if (classPeriod !== dragTarget) {
    if (classPeriod && event && event.currentTarget) {
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
      freezeTransform(element, classPeriod);
      updateDropTarget();
    } else {
      dragElement = null;
    }

    dragTarget = classPeriod;
    dropTarget = classPeriod;
    dragSource = classPeriod;

    updatePeriods();
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

document.addEventListener("mousemove", (event: MouseEvent) => {
  onMove(event.pageX, event.pageY)
});

document.addEventListener("touchmove", (event: TouchEvent) => {
  if (event.touches.length > 0) {
    onMove(event.touches[0].pageX, event.touches[0].pageY)
  }

  if (dragElement) {
    event.preventDefault()
    event.stopPropagation()
  }
}, {passive: false})

document.addEventListener("scroll", () => {
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

document.addEventListener("mouseup", drop)
document.addEventListener("touchend", drop, {passive: false})
document.addEventListener("blur", drop)
