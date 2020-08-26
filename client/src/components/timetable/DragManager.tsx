import React, {
  FunctionComponent, useState, useContext, createContext,
} from 'react';
import { ClassData, ClassPeriod } from '../../interfaces/CourseData';

const transitionTime = 350;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;
export const elevatedScale = 1.1;

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const moveElement = (element: HTMLElement, offsetX: number, offsetY: number) => {
  element.style.left = toPx(fromPx(element.style.left) + offsetX);
  element.style.top = toPx(fromPx(element.style.top) + offsetY);
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

export const classTransformStyle = (classPeriod: ClassPeriod, elevated: boolean) => (
  `translate(
    ${classTranslateX(classPeriod)}%,
    ${classTranslateY(classPeriod)}%
  ) scale(${elevated ? elevatedScale : 1})`
);

export const checkCanDrop = (a: ClassPeriod, b: ClassPeriod) => (
  a === b || (
    a.class.course.code === b.class.course.code
    && a.class.activity === b.class.activity
    && a.time.end - a.time.start === b.time.end - b.time.start
  )
);

const freezeTransform = (element: HTMLElement, classPeriod: ClassPeriod) => {
  element.style.transform = classTransformStyle(classPeriod, true);
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

const DragContext = createContext<{
  dragTarget: ClassPeriod | null
  setDragTarget:(classPeriod: ClassPeriod | null, element?: HTMLElement) => void
  dropTarget: ClassPeriod | null
  morphPeriods: (from: ClassPeriod[], to: ClassPeriod[]) => (ClassPeriod | null)[]
}>({
      dragTarget: null,
      setDragTarget: () => {},
      dropTarget: null,
      morphPeriods: () => ([]),
    });

let dragElement: HTMLElement | null = null;
let dragSource: ClassPeriod | null = null;
const dropzones = new Map<ClassPeriod, HTMLElement>();

export const registerDropzone = (classPeriod: ClassPeriod, element: HTMLElement) => {
  dropzones.set(classPeriod, element);
};

export const unregisterDropzone = (classPeriod: ClassPeriod) => {
  dropzones.delete(classPeriod);
};

const updateDropzones = (target: ClassPeriod | null) => {
  Array.from(dropzones.entries()).forEach(([classPeriod, element]) => {
    const canDrop = target ? checkCanDrop(target, classPeriod) : false;
    const isDropTarget = classPeriod && classPeriod === target;

    let opacity = '0';
    if (canDrop) opacity = isDropTarget ? '0.7' : '0.3';

    element.style.opacity = opacity;
    element.style.pointerEvents = canDrop ? 'auto' : 'none';
  });
};

export const DragManager: FunctionComponent<{
  selectClass(classData: ClassData): void
}> = React.memo(({
  selectClass,
  children,
}) => {
  const [{ dragTarget, dropTarget }, setTargets] = useState<{
    dragTarget: ClassPeriod | null
    dropTarget: ClassPeriod | null
  }>({
    dragTarget: null,
    dropTarget: null,
  });

  const updateDropTarget = () => {
    if (!dragTarget || !dragElement) {
      return;
    }

    const dragRect = dragElement.getBoundingClientRect();

    // dropzone with greatest area of intersection
    const bestMatch = Array.from(dropzones.entries()).filter(([classPeriod]) => (
      checkCanDrop(dragTarget, classPeriod)
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
      setTargets({ dragTarget, dropTarget: newDropTarget });
      selectClass(newDropTarget.class);
      updateDropzones(newDropTarget);
    }
  };

  const morphPeriods = (a: ClassPeriod[], b: ClassPeriod[]) => {
    const from = [...a];
    let to = [...b];

    const result: (ClassPeriod | null)[] = Array(from.length).fill(null);

    if (
      dragTarget && dropTarget && dragTarget !== dropTarget
      && from.includes(dragTarget) && to.includes(dropTarget)
    ) {
      to = to.filter((period) => period !== dropTarget);
      result[from.indexOf(dragTarget)] = dropTarget;
      setTargets({ dragTarget: dropTarget, dropTarget });
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

  const handleDragTarget = (classPeriod: ClassPeriod | null, element?: HTMLElement) => {
    if (classPeriod !== dragTarget) {
      if (classPeriod && element) {
        element.style.transition = moveTransition;
        document.documentElement.style.cursor = 'grabbing';

        freezeTransform(element, classPeriod);
        dragElement = element;
        updateDropTarget();
      } else {
        dragElement = null;
      }

      setTargets({ dragTarget: classPeriod, dropTarget: classPeriod });
      dragSource = classPeriod;

      updateDropzones(classPeriod);
    }
  };

  let lastUpdate = 0;

  window.onmousemove = (event: any) => {
    if (dragElement) {
      moveElement(dragElement, event.movementX, event.movementY);

      if (Date.now() - lastUpdate > 30) {
        updateDropTarget();
        lastUpdate = Date.now();
      }
    }
  };

  window.onmouseup = () => {
    if (dragElement) {
      const { style } = dragElement;
      style.transition = defaultTransition;
      style.left = toPx(0);
      style.top = toPx(0);
      document.documentElement.style.cursor = 'default';
      unfreezeTransform(dragElement);
    }

    handleDragTarget(null);
  };

  return (
    <DragContext.Provider value={{
      dragTarget,
      setDragTarget: handleDragTarget,
      dropTarget,
      morphPeriods,
    }}
    >
      {children}
    </DragContext.Provider>
  );
});

export const useDrag = () => useContext(DragContext);
