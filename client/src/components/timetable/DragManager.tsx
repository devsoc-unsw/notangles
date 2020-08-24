import React, {
  FunctionComponent, useState, createContext, useContext,
} from 'react';
import { ClassData, ClassPeriod } from '../../interfaces/CourseData';
import { timeToPosition } from './Dropzone';

const transitionTime = 250;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;
export const elevatedScale = 1.2;

// maps class period => HTML element
const dropzones = new Map<ClassPeriod, HTMLElement>();

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const moveElement = (element: HTMLElement, offsetX: number, offsetY: number) => {
  element.style.left = toPx(fromPx(element.style.left) + offsetX);
  element.style.top = toPx(fromPx(element.style.top) + offsetY);
};

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

const freezeTransform = (element: HTMLElement, classPeriod: ClassPeriod) => {
  element.style.transform = classTransformStyle(classPeriod, true);
}

const unfreezeTransform = (element: HTMLElement) => {
  element.style.removeProperty("transform");
}

const intersectionArea = (e1: Element, e2: Element) => {
  const r1 = e1.getBoundingClientRect();
  const r2 = e2.getBoundingClientRect();

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

// const hasIntersection = (a: any[], b: any[]) => a.some(x => b.includes(x));

export const checkCanDrop = (a: ClassPeriod, b: ClassPeriod) => (
  a.class.course.code === b.class.course.code
  && a.class.activity === b.class.activity
  && a.time.end - a.time.start === b.time.end - b.time.start
  // && hasIntersection(a.time.weeks, b.time.weeks)
);

const DragContext = createContext<{
  dragTarget: ClassPeriod | null,
  setDragTarget:(classPeriod: ClassPeriod | null, element?: HTMLElement) => void
  dropTarget: ClassPeriod | null,
  registerDropzone: (element: HTMLElement, classPeriod: ClassPeriod) => void
  morphPeriods: (
    from: ClassPeriod[], to: ClassPeriod[], drag: ClassPeriod | null, drop: ClassPeriod | null
  ) => (ClassPeriod | null)[]
}>({
      dragTarget: null,
      setDragTarget: () => {},
      dropTarget: null,
      registerDropzone: () => {},
      morphPeriods: () => ([]),
    });

export const DragManager: FunctionComponent<{
  selectClass(classData: ClassData): void
}> = ({
  selectClass,
  children,
}) => {
  const [dragElement, setDragElement] = useState<HTMLElement | null>(null);
  const [dragTarget, setDragTarget] = useState<ClassPeriod | null>(null);
  const [dropTarget, setDropTarget] = useState<ClassPeriod | null>(null);

  const updateDropTarget = () => {
    if (!dragTarget || !dragElement) {
      setDropTarget(null);
      return;
    }

    // dropzone with greatest area of intersection
    const bestMatch = Array.from(dropzones.entries()).filter(([classPeriod]) => (
      checkCanDrop(dragTarget, classPeriod)
    )).map(([classPeriod, dropElement]) => (
      {
        classPeriod,
        area: dragElement ? intersectionArea(dragElement, dropElement) : 0,
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
    const newDropTarget = classPeriod && area > 0 ? classPeriod : dragTarget;

    if (newDropTarget !== dropTarget) {
      setDropTarget(newDropTarget);
      if (newDropTarget) selectClass(newDropTarget.class);
    }
  };

  const morphPeriods = (
    from: ClassPeriod[], to: ClassPeriod[], drag: ClassPeriod | null, drop: ClassPeriod | null
  ) => {
    const result: (ClassPeriod | null)[] = Array(from.length).fill(null);
    
    if (drag && drop && from.includes(drag) && to.includes(drop)) {
      result[from.indexOf(drag)] = drop;
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
            return {toPeriod, distance};
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
      // if (result[result.length - 1] !== null) {
      if (match) {
        to = to.filter((period) => period !== match);
      }

      result[i] = match;
    });

    return result;
  };

  const registerDropzone = (element: HTMLElement, classPeriod: ClassPeriod) => {
    dropzones.set(classPeriod, element);
  };

  const handleDragTarget = (classPeriod: ClassPeriod | null, element?: HTMLElement) => {
    if (classPeriod !== dragTarget) {
      if (classPeriod && element) {
        element.style.transition = moveTransition;
        document.documentElement.style.cursor = 'grabbing';
        freezeTransform(element, classPeriod);
        setDragElement(element);
        updateDropTarget();
      } else {
        setDragElement(null);
      }

      setDragTarget(classPeriod);
    }
  };

  window.onmousemove = (event: any) => {
    if (dragElement) {
      moveElement(dragElement, event.movementX, event.movementY);
      updateDropTarget();
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

      if (dropTarget) selectClass(dropTarget.class);
    }

    handleDragTarget(null);
    setDropTarget(null);
  };

  return (
    <DragContext.Provider value={{
      dragTarget,
      setDragTarget: handleDragTarget,
      dropTarget,
      registerDropzone,
      morphPeriods,
    }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = () => useContext(DragContext);
