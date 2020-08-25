import React, { FunctionComponent, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  useDrag,
  defaultTransition,
  timeToPosition,
  registerDropzone,
  unregisterDropzone,
  checkCanDrop
} from './DragManager';
import { ClassPeriod } from '../../interfaces/CourseData';

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
  // z-index: 3000;
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
  transition: ${defaultTransition};
`;

interface CellProps {
  classPeriod: ClassPeriod;
  color: string
}

const Dropzone: FunctionComponent<CellProps> = React.memo(({
  classPeriod,
  color,
}) => {
  const { dragTarget, dropTarget } = useDrag();

  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element.current) registerDropzone(classPeriod, element.current);
    return () => {
      if (element.current) unregisterDropzone(classPeriod);
    }
  }, []);

  const canDrop = dragTarget ? checkCanDrop(dragTarget, classPeriod) : false;
  const isDropTarget = classPeriod === dropTarget;

  return (
    <StyledCell
      ref={element}
      classPeriod={classPeriod}
      canDrop={canDrop}
      isDropTarget={isDropTarget}
      color={color}
    />
  );
});

export { Dropzone };
