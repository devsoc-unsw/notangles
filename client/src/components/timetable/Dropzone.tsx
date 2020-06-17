import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { Period } from '../../interfaces/CourseData';


export const timeToPosition = (time: number) => {
  const hour = Math.floor(time);
  const minute = (time - hour) * 60;
  return (hour - 7) * 2 + (minute === 30 ? 1 : 0) - 2;
};

const StyledCell = styled.div<{
  classTime: Period
  canDrop: boolean
  color: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  grid-column: ${(props) => props.classTime.time.day + 1};
  grid-row: ${(props) => timeToPosition(props.classTime.time.start)} /
    ${(props) => timeToPosition(props.classTime.time.end)};
  background-color: ${(props) => props.color};

  transition: opacity 200ms;
  opacity: ${(props) => (props.canDrop ? 0.3 : 0)};
  pointer-events: ${(props) => (props.canDrop ? 'auto' : 'none')};
`;

interface CellProps {
  courseCode: string
  activity: string
  classTime: Period
  color: string
  onDrop(): void
}

const Dropzone: React.FC<CellProps> = ({
  courseCode,
  activity,
  classTime,
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
      canDrop={canDrop}
      color={color}
    />
  );
};

export { Dropzone };
