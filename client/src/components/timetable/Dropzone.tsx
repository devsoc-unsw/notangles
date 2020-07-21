import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDrag } from './DragManager';
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
  const { dragTarget, registerDropzone } = useDrag();
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    element.current && registerDropzone(element.current, classPeriod)
  }, [])

  const canDrop = (
    dragTarget != null
    && dragTarget.class.course.code === classPeriod.class.course.code
    && dragTarget.class.activity === classPeriod.class.activity
    && dragTarget.time.end - dragTarget.time.start === classPeriod.time.end - classPeriod.time.start
  );

  return (
    <StyledCell
      ref={element}
      classPeriod={classPeriod}
      canDrop={canDrop}
      color={color}
      style={{
        opacity: canDrop ? 0.3 : 0
      }}
    />
  );
};

export { Dropzone };
