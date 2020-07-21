import React, {
  FunctionComponent, useState, createContext, useContext,
} from 'react';
import { ClassData, ClassPeriod } from '../../interfaces/CourseData';

const transitionTime = 200;
export const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;

let dragElement: HTMLElement | null = null;

// maps HTML element => class period
const dropzones = new Map<ClassPeriod, HTMLElement>();

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;

const moveElement = (element: HTMLElement, offsetX: number, offsetY: number) => {
  element.style.left = toPx(fromPx(element.style.left) + offsetX);
  element.style.top = toPx(fromPx(element.style.top) + offsetY);
};

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

export const checkCanDrop = (a: ClassPeriod, b: ClassPeriod) => (
  a != null
  && a.class.course.code === b.class.course.code
  && a.class.activity === b.class.activity
  && a.time.end - a.time.start === b.time.end - b.time.start
);

const DragContext = createContext<{
  dragTarget: ClassPeriod | null,
  setDragTarget:(classPeriod: ClassPeriod | null, element?: HTMLElement) => void
  dropTarget: ClassPeriod | null,
  registerDropzone: (element: HTMLElement, classPeriod: ClassPeriod) => void
  morphPeriods: (from: ClassPeriod[], to: ClassPeriod[]) => (ClassPeriod | null)[]
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
  const [dragTarget, setDragTarget] = useState<ClassPeriod | null>(null);
  const [dropTarget, setDropTarget] = useState<ClassPeriod | null>(null);

  const updateDropTarget = () => {
    if (dragElement == null) {
      setDropTarget(null);
      return;
    }

    // dropzone with greatest area of intersection
    const bestMatch = Array.from(dropzones.entries()).filter(([, dropElement]) => (
      dropElement.style.opacity !== '0'
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
    const newDropTarget = classPeriod && area > 0 ? classPeriod : null;

    if (newDropTarget !== dropTarget) {
      setDropTarget(newDropTarget);
    }
  };

  const morphPeriods = (from: ClassPeriod[], to: ClassPeriod[]) => {
    const result: (ClassPeriod | null)[] = [];

    const toPairs: [ClassPeriod, HTMLElement][] = to.map(
      (classPeriod) => [classPeriod, dropzones.get(classPeriod)],
    ).filter(([, element]) => element !== undefined) as [ClassPeriod, HTMLElement][];

    from.forEach((fromPeriod: ClassPeriod) => {
      let match: ClassPeriod | null = null;

      if (to.includes(fromPeriod)) {
        match = fromPeriod;
      } else {
        const fromElement = dropzones.get(fromPeriod);

        if (fromElement) {
          const closest = toPairs.filter(([toPeriod]) => (
            checkCanDrop(fromPeriod, toPeriod)
          )).map(([toPeriod, toElement]) => (
            {
              toPeriod,
              distance: distanceBetween(fromElement, toElement),
            }
          )).reduce((max, current) => (
            current.distance > max.distance ? current : max
          ), {
            toPeriod: undefined,
            distance: 0,
          } as {
            toPeriod?: ClassPeriod
            distance: number
          });

          const { toPeriod } = closest;
          match = toPeriod || null;
        } else {
          match = null;
        }
      }

      // remove from `to` array if match was found
      if (result[result.length - 1] !== null) {
        to = to.filter((period) => period !== match);
      }

      result.push(match);
    });

    return result;
  };

  const registerDropzone = (element: HTMLElement, classPeriod: ClassPeriod) => {
    dropzones.set(classPeriod, element);
  };

  const handleDragTarget = (classPeriod: ClassPeriod | null, element?: HTMLElement) => {
    if (element) {
      element.style.transition = moveTransition;
      document.documentElement.style.cursor = 'grabbing';
      dragElement = element;
      updateDropTarget();
    } else {
      dragElement = null;
    }

    setDragTarget(classPeriod);
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
