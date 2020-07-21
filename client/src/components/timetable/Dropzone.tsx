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
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 20;

  grid-column: ${(props) => props.classPeriod.time.day + 1};
  grid-row: ${(props) => timeToPosition(props.classPeriod.time.start)} /
    ${(props) => timeToPosition(props.classPeriod.time.end)};
  background-color: ${(props) => props.color};

  transition: opacity 0.2s;
  pointer-events: ${(props) => (props.canDrop ? 'auto' : 'none')};
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
      color={color}
      style={{ opacity }}
    />
  );
};

export { Dropzone };
