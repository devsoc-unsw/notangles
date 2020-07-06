import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, ClassData } from '../../interfaces/CourseData';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses from './DroppedClasses';
import Inventory from '../inventory/Inventory';

const rowHeight = 86;

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  min-height: ${(props) => props.rows * rowHeight}px;
  max-height: ${(props) => props.rows * rowHeight}px; // TODO: should be different to min-height
  margin-top: 15px;
  box-sizing: content-box;
  user-select: none;

  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${(props) => props.rows}, 1fr) / auto repeat(${days.length}, 1fr) 11px 1fr;
`;

let dragElement: HTMLElement | null = null;
let zIndex = 1200;
const moveTransition = 200;
const fromPx = (value: string) => Number(value.split("px")[0]);
const toPx = (value: number) => value + "px";
const moveElement = (element: HTMLElement, offsetX: number, offsetY: number) => {
  element.style.left = toPx(fromPx(element.style.left) + offsetX);
  element.style.top  = toPx(fromPx(element.style.top)  + offsetY);
}

// called when drag begins on a class
const handleDragElement = (element: HTMLElement) => {
  dragElement = element;
  element.style.zIndex = String(++zIndex);
}

window.onmousemove = (event: any) => {
  if (dragElement) {
    moveElement(dragElement, event.movementX, event.movementY);
  }
}

window.onmouseup = () => {
  if (dragElement) {
    dragElement.style.transition = moveTransition + "ms";
    dragElement.style.left = toPx(0);
    dragElement.style.top = toPx(0);

    const oldDragElement = dragElement;
    setTimeout(() => {
      oldDragElement.style.transition = "none";
    }, moveTransition + 50); // + 50 as padding time
  }

  dragElement = null;
}

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  onSelectClass(classData: ClassData): void
  onRemoveClass(classData: ClassData): void
}

const Timetable: FunctionComponent<TimetableProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  is12HourMode,
  setIs12HourMode,
  onSelectClass,
  onRemoveClass,
}) => (
  <StyledTimetable
    rows={Math.max(...selectedCourses.map(
      (course) => course.latestFinishTime,
    ), defaultEndTime) - defaultStartTime}
  >
    <Inventory
      key={selectedCourses.map((course) => course.code).join(',')}
      selectedCourses={selectedCourses}
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
      removeClass={onRemoveClass}
    />
    <TimetableLayout
      days={days}
      is12HourMode={is12HourMode}
      setIs12HourMode={setIs12HourMode}
      selectedCourses={selectedCourses}
    />
    <ClassDropzones
      selectedCourses={selectedCourses}
      assignedColors={assignedColors}
      onSelectClass={onSelectClass}
    />
    <DroppedClasses
      selectedCourses={selectedCourses}
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
      setDragElement={handleDragElement}
    />
  </StyledTimetable>
);

export default Timetable;
