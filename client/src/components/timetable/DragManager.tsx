import React, {
  FunctionComponent, useState, createContext, useContext,
} from 'react';
import { ClassPeriod } from '../../interfaces/CourseData';

const transitionTime = 200;
const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;

let dragElement: HTMLElement | null = null;

// maps HTML element => class period
let dropzones = new Map<HTMLElement, ClassPeriod>();

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

const DragContext = createContext<{
  dragTarget: ClassPeriod | null,
  dropTarget: ClassPeriod | null,
  registerDropzone: (element: HTMLElement, classPeriod: ClassPeriod) => void
  setDragTarget: (classPeriod: ClassPeriod | null, element?: HTMLElement) => void
}>({
  dragTarget: null,
  dropTarget: null,
  registerDropzone: () => {},
  setDragTarget: () => {},
});

export const DragManager: FunctionComponent = (props) => {
  const [dragTarget, setDragTarget] = useState<ClassPeriod | null>(null);
  const [dropTarget, setDropTarget] = useState<ClassPeriod | null>(null);

  // TODO
  const updateDropTarget = () => {
    if (dragElement == null) {
      setDropTarget(null);
      return;
    }

    const bestMatch = Array.from(
      document.getElementsByClassName('dropzone')
    ).filter((dropzoneElement) => (
      (dropzoneElement as HTMLElement).style.opacity !== "0"
    )).map((dropzoneElement) => (
      {
        dropzoneElement,
        area: dragElement ? intersectionArea(dragElement, dropzoneElement) : 0
      }
    )).reduce((max, current) => (
      current.area > max.area ? current : max
    ), {
      dropzoneElement: null,
      area: 0
    } as {
      dropzoneElement: Element | null
      area: number
    })

    const { dropzoneElement, area } = bestMatch;

    if (dropzoneElement) {
      const classPeriod = dropzones.get(dropzoneElement as HTMLElement)
      if (classPeriod) {
        console.log(classPeriod.time)
        // setDropTarget(area > 0 ? dropzoneElement : null);
      }
    }
  }

  const registerDropzone = (element: HTMLElement, classPeriod: ClassPeriod) => {
    dropzones.set(element, classPeriod)
  }

  const handleDragTarget = (classPeriod: ClassPeriod | null, element?: HTMLElement) => {
    if (element) {
      element.style.transition = moveTransition;
      document.documentElement.style.cursor = 'grabbing';
      dragElement = element;
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
    }
    handleDragTarget(null);
  };

  return (
    <DragContext.Provider value={{
      dragTarget,
      dropTarget,
      registerDropzone,
      setDragTarget: handleDragTarget,
    }}
    >
      {props.children}
    </DragContext.Provider>
  );
};

export const useDrag = (): {
  dragTarget: ClassPeriod | null,
  dropTarget: ClassPeriod | null,
  registerDropzone: (element: HTMLElement, classPeriod: ClassPeriod) => void
  setDragTarget: (classPeriod: ClassPeriod | null, element?: HTMLElement) => void
} => useContext(DragContext);
