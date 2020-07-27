import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { ClassPeriod } from '@notangles/common';


export const timeToPosition = (time: number, earliestStartTime: number) => {
  const hour = Math.floor(time);
  const minute = (time - hour) * 60;
  return (hour - (earliestStartTime - 2)) * 2 + (minute === 30 ? 1 : 0) - 2;
};

const StyledCell = styled.div<{
  classTime: ClassPeriod
  earliestStartTime: number
  canDrop: boolean
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 20;

  grid-column: ${(props) => props.classTime.time.day + 1};
  grid-row: ${(props) => timeToPosition(props.classTime.time.start, props.earliestStartTime)} /
    ${(props) => timeToPosition(props.classTime.time.end, props.earliestStartTime)};
  background-color: ${(props) => props.color};

  transition: opacity 0.2s;
  opacity: ${(props) => (props.canDrop ? 0.3 : 0)};
  pointer-events: ${(props) => (props.canDrop ? 'auto' : 'none')};
`;

interface CellProps {
  courseCode: string
  activity: string
  classTime: ClassPeriod
  earliestStartTime: number
  color: string
  onDrop(): void
}

const Dropzone: React.FC<CellProps> = ({
  courseCode,
  activity,
  classTime,
  earliestStartTime,
  color,
  onDrop,
}) => {
  const [{ canDrop }, drop] = useDrop({
    accept: `${courseCode}-${activity}`,
    drop: onDrop,
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  });

  return (
    <StyledCell
      ref={drop}
      classTime={classTime}
      earliestStartTime={earliestStartTime}
      canDrop={canDrop}
      color={color}
    />
  );
};

export { Dropzone };
