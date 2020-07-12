import { useState } from 'react';
import { ClassPeriod } from '../../interfaces/CourseData';

const transitionTime = 200;
const defaultTransition = `all ${transitionTime}ms`;
const moveTransition = `transform ${transitionTime}ms`;

let dragElement: HTMLElement | null = null;
let zIndex = 1200; // starts above material app bar

const fromPx = (value: string) => Number(value.split('px')[0]);
const toPx = (value: number) => `${value}px`;
const moveElement = (element: HTMLElement, offsetX: number, offsetY: number) => {
  element.style.left = toPx(fromPx(element.style.left) + offsetX);
  element.style.top = toPx(fromPx(element.style.top) + offsetY);
};

const useDragTarget = (): [
  ClassPeriod | null,
  (classPeriod: ClassPeriod | null, element?: HTMLElement) => void
] => {
  const [dragTarget, setDragTarget] = useState<ClassPeriod | null>(null);

  const handleDragTarget = (classPeriod: ClassPeriod | null, element?: HTMLElement) => {
    if (element) {
      element.style.zIndex = String(++zIndex);
      element.style.transition = moveTransition;
      dragElement = element;
    } else {
      dragElement = null;
    }
    setDragTarget(classPeriod);
  };

  window.onmousemove = (event: any) => {
    if (dragElement) {
      moveElement(dragElement, event.movementX, event.movementY);
    }
  };

  window.onmouseup = () => {
    if (dragElement) {
      dragElement.style.transition = defaultTransition;
      dragElement.style.left = toPx(0);
      dragElement.style.top = toPx(0);
    }
    handleDragTarget(null);
  };

  return [dragTarget, handleDragTarget];
};

export default useDragTarget;
