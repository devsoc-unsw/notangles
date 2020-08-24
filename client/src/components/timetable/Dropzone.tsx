import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDrag, checkCanDrop } from './DragManager';
import { ClassPeriod } from '../../interfaces/CourseData';

export const timeToPosition = (time: number) => Math.floor(time) - 7;

const StyledCell = styled.div.attrs(() => ({
  className: 'dropzone',
}))<{
  classPeriod: ClassPeriod
  canDrop: boolean
  isDropTarget: boolean
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // z-index: 1005;
  z-index: 20;

  grid-column: ${({classPeriod}) => classPeriod.time.day + 1};
  grid-row: ${({classPeriod}) => timeToPosition(classPeriod.time.start)} /
    ${({classPeriod}) => timeToPosition(classPeriod.time.end)};
  background-color: ${({color}) => color};
  pointer-events: ${({canDrop}) => (canDrop ? 'auto' : 'none')};

  opacity: ${({canDrop, isDropTarget}) => {
    let opacity = 0;
    if (canDrop) opacity = isDropTarget ? 0.7 : 0.3;
    return opacity;
  }};
  transition: opacity 0.2s;
`;

interface CellProps {
  classPeriod: ClassPeriod;
  color: string
}

const Dropzone: React.FC<CellProps> = ({
  classPeriod,
  color,
}) => {
  const {
    dragTarget,
    dropTarget,
    registerDropzone,
  } = useDrag();
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element.current) registerDropzone(element.current, classPeriod);
  }, []);

  const canDrop = dragTarget ? checkCanDrop(dragTarget, classPeriod) : false;
  const isDropTarget = classPeriod === dropTarget;

  let opacity = 0;
  if (canDrop) opacity = isDropTarget ? 0.7 : 0.3;

  return (
    <StyledCell
      ref={element}
      classPeriod={classPeriod}
      canDrop={canDrop}
      isDropTarget={isDropTarget}
      color={color}
    />
  );
};

export { Dropzone };
